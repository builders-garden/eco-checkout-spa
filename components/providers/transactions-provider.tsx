import {
  ConsecutiveWagmiActionReturnType,
  useConsecutiveWagmiActions,
  InitialWagmiAction,
  WagmiActionType,
  ActionStatus,
} from "@/hooks/use-consecutive-wagmi-actions";
import { config } from "@/lib/appkit";
import { useAppKitAccount } from "@reown/appkit/react";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { usePaymentParams } from "./payment-params-provider";
import { useSelectedTokens } from "./selected-tokens-provider";
import {
  ExecuteIntentResponse,
  GetIntentDataResponse,
} from "@/lib/relayoor/types";
import ky from "ky";
import { PERMIT3_TYPES } from "@/lib/constants";
import {
  chainStringToChainId,
  getAmountDeductedFromIntents,
} from "@/lib/utils";
import { erc20Abi } from "viem";
import { TokenSymbols } from "@/lib/enums";
import { getChains } from "@wagmi/core";

export const TransactionsContext = createContext<
  TransactionsContextType | undefined
>(undefined);

export type TransactionsContextType = {
  consecutiveWagmiActionsObject: ConsecutiveWagmiActionReturnType;
  isError: boolean;
  getRequestIDAndSignatureData: () => void;
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
  const {
    selectedTokens,
    allowanceOrTransfers,
    permit3SignatureData,
    requestID,
    sendIntents,
  } = useSelectedTokens();
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
  const getRequestIDAndSignatureData = () => {
    if (
      address &&
      desiredNetworkString &&
      desiredToken &&
      amountDueRaw &&
      recipient &&
      permit3SignatureData &&
      requestID &&
      allowanceOrTransfers.length > 0
    ) {
      try {
        // Get the signature initial wagmi action
        const signatureInitialWagmiAction: InitialWagmiAction | undefined =
          allowanceOrTransfers.length > 1
            ? {
                type: WagmiActionType.SIGN_TYPED_DATA,
                data: {
                  domain: permit3SignatureData.domain,
                  types: PERMIT3_TYPES,
                  primaryType: "SignedUnhingedPermit3",
                  message: permit3SignatureData.message,
                },
                chainId: 1,
                onSuccess: async (args) => {
                  // Get the response RequestID and userSignedMessage
                  const { userSignedMessage, updateActionInfo } = args;

                  if (!userSignedMessage || !requestID) {
                    throw new Error(
                      "User signed message and requestID are required"
                    );
                  }

                  // Execute intent
                  await ky
                    .post<ExecuteIntentResponse>(
                      `/api/intents/execute-intent`,
                      {
                        json: {
                          requestID,
                          userSignedMessage,
                        },
                        timeout: false,
                      }
                    )
                    .json();

                  // Get the intent data
                  let intentData: GetIntentDataResponse | undefined = undefined;
                  while (
                    !intentData?.data.destinationChainTxHash &&
                    !intentData?.data.destinationChainID
                  ) {
                    intentData = await ky
                      .get<GetIntentDataResponse>(
                        `/api/intents/get-intent-data/${requestID}`,
                        { timeout: false }
                      )
                      .json();

                    // Wait 1.5 seconds before next API call
                    if (
                      !intentData?.data.destinationChainTxHash &&
                      !intentData?.data.destinationChainID
                    ) {
                      await new Promise((resolve) => setTimeout(resolve, 1500));
                    }
                  }

                  // Get the block explorer url
                  const blockExplorerBaseUrl = getChains(config).find(
                    (chain) => chain.id === intentData.data.destinationChainID
                  )?.blockExplorers?.default.url;

                  // Update the action status to success
                  updateActionInfo(currentActionIndex, {
                    status: ActionStatus.PENDING,
                    hash: intentData.data.destinationChainTxHash,
                    txLink: `${blockExplorerBaseUrl}/tx/${intentData.data.destinationChainTxHash}`,
                  });
                },
                metadata: {
                  description: "Sign and Execute Intent",
                  involvedTokens: selectedTokens
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
                },
              }
            : undefined;

        // Get the selected tokens initial wagmi actions
        const selectedTokensInitialWagmiActions: InitialWagmiAction[] =
          selectedTokens
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

              const amountToSend = getAmountDeductedFromIntents(
                token,
                sendIntents,
                amountDueRaw
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
            .filter((action) => action !== undefined);

        // Get the initial wagmi actions
        // If there is a signature initial wagmi action, add it to the actions
        // and then add the selected tokens initial wagmi actions
        // Otherwise, just add the selected tokens initial wagmi actions
        const initialWagmiActions: InitialWagmiAction[] =
          signatureInitialWagmiAction
            ? [
                signatureInitialWagmiAction,
                ...selectedTokensInitialWagmiActions,
              ]
            : selectedTokensInitialWagmiActions;

        setInitialWagmiActions(initialWagmiActions);
      } catch (error) {
        setIsError(true);
        console.log("error", error);
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
