import {
  ConsecutiveWagmiActionReturnType,
  useConsecutiveWagmiActions,
  InitialWagmiAction,
  WagmiActionType,
} from "@/hooks/use-consecutive-wagmi-actions";
import { config } from "@/lib/appkit";
import { useAppKitAccount } from "@reown/appkit/react";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { usePaymentParams } from "./payment-params-provider";
import { useSelectedTokens } from "./selected-tokens-provider";
import {
  ExecuteIntentResponse,
  GetIntentResponse,
  Permit3SignatureData,
} from "@/lib/relayoor/types";
import ky from "ky";
import { PERMIT3_TYPES } from "@/lib/constants";
import { chainStringToChainId, getAmountDeducted } from "@/lib/utils";
import { erc20Abi } from "viem";
import { TokenSymbols } from "@/lib/enums";

export const TransactionsContext = createContext<
  TransactionsContextType | undefined
>(undefined);

export type TransactionsContextType = {
  consecutiveWagmiActionsObject: ConsecutiveWagmiActionReturnType;
  isLoading: boolean;
  isError: boolean;
  getRequestIDAndSignatureData: () => Promise<void>;
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error(
      "useTransactions must be used within a TransactionsProvider"
    );
  }
  return context;
};

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const { address } = useAppKitAccount();
  const { paymentParams, desiredNetworkString, amountDueRaw } =
    usePaymentParams();
  const { recipient, desiredToken, desiredNetworkId } = paymentParams;
  const { selectedTokens } = useSelectedTokens();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [initialWagmiActions, setInitialWagmiActions] = useState<
    InitialWagmiAction[]
  >([]);

  const {
    start,
    retry,
    pause,
    queuedActions,
    hookStatus,
    currentActionIndex,
    addAction,
    currentAction,
  } = useConsecutiveWagmiActions({
    config,
    initialWagmiActions,
  });

  // Fills the initialWagmiActions array which will be used to send the transactions
  const getRequestIDAndSignatureData = async () => {
    if (
      address &&
      desiredNetworkString &&
      desiredToken &&
      amountDueRaw &&
      recipient
    ) {
      try {
        setIsLoading(true);
        const response = await ky
          .post<{
            signatureData: Permit3SignatureData;
            requestID: string;
          }>(
            `/api/send?sender=${address}&recipient=${recipient}&destinationNetwork=${desiredNetworkString}&destinationToken=${desiredToken}&transferAmount=${amountDueRaw}`,
            {
              timeout: false,
            }
          )
          .json();

        if (!response.signatureData || !response.requestID) {
          throw new Error("Failed to get intents");
        }

        const initialWagmiActions: InitialWagmiAction[] = [
          {
            type: WagmiActionType.SIGN_TYPED_DATA,
            data: {
              domain: response.signatureData.domain,
              types: PERMIT3_TYPES,
              primaryType: "SignedUnhingedPermit3",
              message: response.signatureData.message,
            },
            chainId: 1,
            onSuccess: async (args) => {
              if (!args.userSignedMessage) {
                throw new Error("User signed message is required");
              }

              console.log(
                "Executing intent with signature",
                response.requestID,
                args.userSignedMessage
              );

              // Execute intent
              const executeIntentResponse = await ky
                .post<ExecuteIntentResponse>(`/api/execute-intent`, {
                  json: {
                    requestID: response.requestID,
                    userSignedMessage: args.userSignedMessage,
                  },
                  timeout: false,
                })
                .json();
              console.log("Intent executed", executeIntentResponse);

              // Map all the quoteIDs
              const quoteIDs = [
                ...executeIntentResponse.data.failures.flatMap((failure) =>
                  failure.quoteIDs.map((quoteID) => quoteID)
                ),
                ...executeIntentResponse.data.successes.flatMap((success) =>
                  success.quoteIDs.map((quoteID) => quoteID)
                ),
              ];

              console.log("Quote IDs", quoteIDs);

              // Get all the intents form the endpoint
              const intentsResponse = await ky
                .post<{
                  quoteIDsArray: {
                    response: GetIntentResponse;
                    destinationTokenAddress: string | undefined;
                  }[];
                }>(`/api/get-intents`, { json: { quoteIDs, creator: address } })
                .json();

              console.log("Intents response", intentsResponse);

              // For each involved token update the metadata with the relative tx Link
            },
            metadata: {
              description: "Sign and Execute Intent",
              involvedTokens: [
                ...selectedTokens
                  .map((token) => {
                    let chainId: number;
                    try {
                      chainId = chainStringToChainId(token.chain);
                    } catch (error) {
                      return undefined;
                    }

                    // Take all the tokens that are not on the desired network
                    if (chainId === desiredNetworkId) {
                      return undefined;
                    }

                    return {
                      chain: token.chain,
                      asset: token.asset,
                      txLink: null,
                      description: `Transfer ${
                        TokenSymbols[token.asset as keyof typeof TokenSymbols]
                      }`,
                    };
                  })
                  .filter((token) => token !== undefined),
                ...selectedTokens
                  .map((token) => {
                    let chainId: number;
                    try {
                      chainId = chainStringToChainId(token.chain);
                    } catch (error) {
                      return undefined;
                    }

                    // Take all the tokens that are not on the desired network
                    if (chainId === desiredNetworkId) {
                      return undefined;
                    }

                    return {
                      chain: token.chain,
                      asset: token.asset,
                      txLink: null,
                      description: `Transfer ${
                        TokenSymbols[token.asset as keyof typeof TokenSymbols]
                      }`,
                    };
                  })
                  .filter((token) => token !== undefined),
              ],
            },
          },
          ...selectedTokens
            .map((token) => {
              let chainId: number;
              try {
                chainId = chainStringToChainId(token.chain);
              } catch (error) {
                return undefined;
              }

              // If it's not the desired network, don't add it to the actions
              // because the intents will already execute that transfer
              if (chainId !== desiredNetworkId) {
                return undefined;
              }

              const amountToSend = getAmountDeducted(
                amountDueRaw,
                selectedTokens,
                token
              );
              return {
                type: WagmiActionType.WRITE_CONTRACT,
                data: {
                  abi: erc20Abi,
                  functionName: "transfer",
                  address: token.tokenContractAddress,
                  args: [recipient, BigInt(amountToSend)],
                  chainId,
                },
                chainId,
                metadata: {
                  chain: token.chain,
                  asset: token.asset,
                  amount: token.amount,
                  description: `Transfer ${
                    TokenSymbols[token.asset as keyof typeof TokenSymbols]
                  }`,
                },
              };
            })
            .filter((action) => action !== undefined),
        ];

        setInitialWagmiActions(initialWagmiActions);
      } catch (error) {
        setIsError(true);
        setIsLoading(false);
        console.log("error", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Memoize the value
  const value = useMemo(
    () => ({
      consecutiveWagmiActionsObject: {
        queuedActions,
        currentAction,
        currentActionIndex,
        hookStatus,
        addAction,
        start,
        retry,
        pause,
      },
      isLoading,
      isError,
      getRequestIDAndSignatureData,
    }),
    [
      queuedActions,
      currentAction,
      currentActionIndex,
      hookStatus,
      addAction,
      start,
      retry,
      pause,
      isLoading,
      isError,
      getRequestIDAndSignatureData,
    ]
  );

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};
