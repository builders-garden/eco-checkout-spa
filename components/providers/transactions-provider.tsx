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
  capitalizeFirstLetter,
  chainStringToChainId,
  getAmountDeducted,
} from "@/lib/utils";
import { erc20Abi } from "viem";
import { TokenSymbols } from "@/lib/enums";
import { getChains } from "@wagmi/core";
import { GroupedInvolvedTokensByChainId } from "@/lib/types";

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
                  const {
                    userSignedMessage,
                    updateActionInfo,
                    currentActionIdx,
                    metadata,
                  } = args;

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

                  // Get the hash array from the API
                  let hashArray: {
                    chainId: number;
                    transactionHash: string;
                  }[] = [];
                  while (hashArray.length === 0) {
                    try {
                      const response = await ky
                        .post<{
                          hashArray: {
                            chainId: number;
                            transactionHash: string;
                          }[];
                        }>(`/api/intents/get-intents`, {
                          json: { requestID, creator: address },
                        })
                        .json();

                      hashArray = response.hashArray;
                    } catch (error) {
                      console.log("Error while getting hash array", error);
                      hashArray = [];
                    }

                    // Wait 1.5 seconds before next API call
                    if (
                      hashArray.length === 0 ||
                      !hashArray.every((h) => h.transactionHash)
                    ) {
                      await new Promise((resolve) => setTimeout(resolve, 1500));
                    }
                  }

                  // Set the hash array to the action metadata to fill each transaction link
                  updateActionInfo(currentActionIdx, {
                    metadata: {
                      ...metadata,
                      involvedTokens: Object.entries(
                        (metadata?.involvedTokens ||
                          {}) as GroupedInvolvedTokensByChainId
                      ).reduce((acc, [chainId, group]) => {
                        // Find the hash for this chainId
                        const hashEntry = hashArray.find(
                          (h) => h.chainId.toString() === chainId
                        );
                        // Get the block explorer base URL
                        const blockExplorerBaseUrl = getChains(config).find(
                          (chain) => chain.id.toString() === chainId
                        )?.blockExplorers?.default.url;
                        acc[chainId] = {
                          ...group,
                          txLink:
                            hashEntry && blockExplorerBaseUrl
                              ? `${blockExplorerBaseUrl}/tx/${hashEntry.transactionHash}`
                              : null,
                        };
                        return acc;
                      }, {} as GroupedInvolvedTokensByChainId),
                    },
                  });

                  // Get the intent data on the destination chain
                  let intentData: GetIntentDataResponse | undefined = undefined;
                  while (
                    !intentData?.data.destinationChainTxHash &&
                    !intentData?.data.destinationChainID
                  ) {
                    try {
                      intentData = await ky
                        .get<GetIntentDataResponse>(
                          `/api/intents/get-intent-data/${requestID}`,
                          { timeout: false }
                        )
                        .json();
                    } catch (error) {
                      console.log("Error while getting intent data", error);
                      intentData = undefined;
                    }

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
                  updateActionInfo(currentActionIdx, {
                    status: ActionStatus.PENDING,
                    hash: intentData.data.destinationChainTxHash,
                    txLink: `${blockExplorerBaseUrl}/tx/${intentData.data.destinationChainTxHash}`,
                  });
                },
                metadata: {
                  description: "Sign and Execute Intent",
                  // Filter out the tokens that are on the desired network
                  // Then create an object grouping tokens by chain id
                  involvedTokens: selectedTokens
                    .filter((token) => token.chain !== desiredNetworkString)
                    .reduce((acc, token) => {
                      // Get the chain id
                      let chainId: string;
                      try {
                        chainId = chainStringToChainId(token.chain).toString();
                      } catch (error) {
                        // If the chain id is not valid, don't add it to the actions
                        return acc;
                      }

                      if (acc[chainId]) {
                        // If the chain id already exists, add the token to the token info array
                        acc[chainId].tokens = [
                          ...acc[chainId].tokens,
                          {
                            asset: token.asset,
                          },
                        ];
                      } else {
                        // If the chain id does not exist, create a new object with the token info
                        acc[chainId] = {
                          chain: token.chain,
                          txLink: null,
                          description: `Transfer from ${capitalizeFirstLetter(
                            token.chain
                          )}`,
                          tokens: [{ asset: token.asset }],
                        };
                      }
                      return acc;
                    }, {} as GroupedInvolvedTokensByChainId),
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

              const amountToSend = getAmountDeducted(
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
        console.log("Error: ", error);
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
