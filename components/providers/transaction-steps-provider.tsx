import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSelectedTokens } from "./selected-tokens-provider";
import { usePaymentParams } from "./payment-params-provider";
import { useAppKitAccount } from "@reown/appkit/react";
import {
  ApproveStep,
  TransactionAsset,
  TransactionStep,
  UserAsset,
} from "@/lib/types";
import {
  OpenQuotingClient,
  RoutesService,
  RoutesSupportedChainId,
  selectCheapestQuote,
} from "@eco-foundation/routes-sdk";
import { CreateIntentParams } from "@eco-foundation/routes-sdk";
import { encodeFunctionData, erc20Abi, Hex, maxUint256 } from "viem";
import { chainStringToChainId, getAmountDeducted, getFees } from "@/lib/utils";
import { TokenDecimals, TransactionStatus } from "@/lib/enums";
import { readContract } from "@wagmi/core";
import { config } from "@/lib/appkit";
import { EcoProtocolAddresses } from "@eco-foundation/routes-ts";
import { useSwitchChain } from "wagmi";

export const TransactionStepsContext = createContext<
  TransactionStepsContextType | undefined
>(undefined);

export type TransactionStepsContextType = {
  transactionSteps: TransactionStep[];
  transactionStepsLoading: boolean;
  transactionStepsError: string | null;
  handleChangeStatus: (index: number, status: TransactionStatus) => void;
  currentStep: TransactionStep | undefined;
  currentStepIndex: number;
};

export const useTransactionSteps = () => {
  const context = useContext(TransactionStepsContext);
  if (!context) {
    throw new Error(
      "useTransactionSteps must be used within a TransactionStepsProvider"
    );
  }
  return context;
};

const routesService = new RoutesService();
const openQuotingClient = new OpenQuotingClient({ dAppID: "eco-dapp" });

export const TransactionStepsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { selectedTokens, selectedTotal } = useSelectedTokens();
  const { paymentParams, areAllPaymentParamsValid } = usePaymentParams();
  const { address } = useAppKitAccount();
  const [transactionSteps, setTransactionSteps] = useState<TransactionStep[]>(
    []
  );
  const [transactionStepsLoading, setTransactionStepsLoading] =
    useState<boolean>(true);
  const [transactionStepsError, setTransactionStepsError] = useState<
    string | null
  >(null);
  const { switchChain } = useSwitchChain();

  // Group tokens by chain
  const tokensByChain = selectedTokens.reduce((acc, token) => {
    const chain = token.chain;
    if (!acc[chain]) {
      acc[chain] = [];
    }
    acc[chain].push(token);
    return acc;
  }, {} as Record<string, UserAsset[]>);

  // UseEffect to create the transaction steps
  useEffect(() => {
    const getTransactionSteps = async () => {
      setTransactionStepsLoading(true);
      if (!areAllPaymentParamsValid || !address) {
        return;
      }

      // This check is separated to prevent the loader from showing when the user
      // connects a wallet without tokens or when the amount due is not met
      if (
        selectedTokens.length === 0 ||
        selectedTotal < paymentParams.amountDue!
      ) {
        setTransactionStepsLoading(false);
        return;
      }

      // Create the transaction steps
      const transactionSteps: TransactionStep[] = [];

      // For each chain, create the transaction steps using all tokens on that chain
      for (const [sourceChain, tokens] of Object.entries(tokensByChain)) {
        // Get the chainId from the chain string
        let chainId: RoutesSupportedChainId;
        try {
          chainId = chainStringToChainId(sourceChain);
        } catch (error) {
          console.error("Invalid chain string", error);
          setTransactionStepsError("Invalid chain string, please try again");
          setTransactionStepsLoading(false);
          return;
        }

        // Get the intent source contract address
        const intentSourceContract =
          EcoProtocolAddresses[routesService.getEcoChainId(chainId)]
            .IntentSource;

        // If the chain is the same as the desired chain, create a transfer step
        // I'm sure there's only one token on the same chain as the desired chain
        if (chainId === paymentParams.desiredNetworkId) {
          const token = tokens[0];

          // Create the transaction asset
          const transactionAsset: TransactionAsset = {
            asset: token.asset,
            amountToSend:
              getAmountDeducted(
                paymentParams.amountDue!,
                selectedTokens,
                token
              ) *
              10 ** token.decimals,
            chain: token.chain,
            tokenContractAddress: token.tokenContractAddress,
            decimals: token.decimals,
          };

          // Create the transfer step
          transactionSteps.push({
            type: "transfer",
            status: TransactionStatus.TO_SEND,
            assets: [transactionAsset],
            to: paymentParams.recipient!,
          });

          // Else, create an intent step using all tokens on the chain
        } else {
          // Get the total amount of tokens to send
          const totalAmountToSendOnCurrentChain = Math.round(
            tokens.reduce(
              (acc, token) =>
                acc +
                getAmountDeducted(
                  paymentParams.amountDue!,
                  selectedTokens,
                  token
                ) *
                  10 ** token.decimals,
              0
            )
          );

          // Get the estimated fees
          const protocolFees = getFees(
            totalAmountToSendOnCurrentChain,
            chainId,
            TokenDecimals[
              paymentParams.desiredToken!.toLowerCase() as keyof typeof TokenDecimals
            ]
          );

          // Get the desired token address of the receiving chain
          const desiredTokenAddress = RoutesService.getStableAddress(
            paymentParams.desiredNetworkId!,
            paymentParams.desiredToken!
          );

          // create calls by encoding transfer function data
          const calls = [
            {
              target: desiredTokenAddress,
              data: encodeFunctionData({
                abi: erc20Abi,
                functionName: "transfer",
                args: [
                  paymentParams.recipient!,
                  BigInt(totalAmountToSendOnCurrentChain - protocolFees),
                ],
              }),
              value: BigInt(0),
            },
          ];

          // create callTokens based on your calls
          const callTokens = [
            {
              token: desiredTokenAddress,
              amount: BigInt(totalAmountToSendOnCurrentChain - protocolFees),
            },
          ];

          // Create the source tokens array
          const sourceTokens: {
            token: Hex;
            amount: bigint;
          }[] = [];
          tokens.forEach((sourceToken) => {
            const amountDeducted = Math.round(
              getAmountDeducted(
                paymentParams.amountDue!,
                selectedTokens,
                sourceToken
              ) *
                10 ** sourceToken.decimals
            );

            sourceTokens.push({
              token: sourceToken.tokenContractAddress,
              amount: BigInt(amountDeducted),
            });
          });

          // Create the intent params
          const intentParams: CreateIntentParams = {
            creator: address as Hex,
            originChainID: chainStringToChainId(
              sourceChain
            ) as RoutesSupportedChainId,
            destinationChainID: paymentParams.desiredNetworkId!,
            calls,
            callTokens,
            tokens: sourceTokens,
            prover: "HyperProver",
          };

          // Create the intent
          const intent = routesService.createIntent(intentParams);

          // Get the optimized intent with quotes
          try {
            const quotes = await openQuotingClient.requestQuotesForIntent(
              intent
            );

            // select the cheapest quote
            const selectedQuote = selectCheapestQuote(quotes);

            // apply quote to intent
            const intentWithQuote = routesService.applyQuoteToIntent({
              intent,
              quote: selectedQuote,
            });

            const transactionAssets: TransactionAsset[] = tokens.map(
              (token) => {
                // Get the amount to send from the intent
                const amountToSend = intentWithQuote.reward.tokens.find(
                  (intentToken) =>
                    intentToken.token.toLowerCase() ===
                    token.tokenContractAddress.toLowerCase()
                )?.amount;

                return {
                  asset: token.asset,
                  amountToSend: Number(amountToSend),
                  chain: token.chain,
                  tokenContractAddress: token.tokenContractAddress,
                  decimals: token.decimals,
                };
              }
            );

            // // For each transaction asset, check the allowance of the token
            for (const transactionAsset of transactionAssets) {
              const allowance = await readContract(config, {
                abi: erc20Abi,
                address: transactionAsset.tokenContractAddress,
                functionName: "allowance",
                args: [address as Hex, intentSourceContract],
                chainId,
              });

              // If the allowance is less than the amount deducted, create the approve step
              if (allowance < transactionAsset.amountToSend) {
                const approveStep: ApproveStep = {
                  type: "approve",
                  status: TransactionStatus.TO_SEND,
                  assets: [transactionAsset],
                  allowanceAmount: maxUint256,
                  intentSourceContract,
                };

                // Add the approve step to the transaction steps
                transactionSteps.push(approveStep);
              }
            }

            // add the optimized intent to the array
            transactionSteps.push({
              type: "intent",
              status: TransactionStatus.TO_SEND,
              assets: transactionAssets,
              intent: intentWithQuote,
              intentSourceContract,
            });
          } catch (error) {
            setTransactionStepsError("Quotes not available, please try again");
            setTransactionStepsLoading(false);
            return;
          }
        }
      }

      setTransactionSteps(transactionSteps);
      setTransactionStepsLoading(false);
    };

    getTransactionSteps();
  }, [selectedTokens, areAllPaymentParamsValid, address]);

  // Handle the change of status of a transaction step
  const handleChangeStatus = (index: number, status: TransactionStatus) => {
    setTransactionSteps((prevSteps) => {
      const newSteps = [...prevSteps];
      newSteps[index] = { ...newSteps[index], status };
      return newSteps;
    });
  };

  // Change the network to the one required for the first step
  useEffect(() => {
    if (transactionSteps.length > 0) {
      const chainId = chainStringToChainId(transactionSteps[0].assets[0].chain);
      switchChain({ chainId });
    }
  }, [transactionSteps]);

  // The current step
  // (the step that is not yet successful)
  const { currentStep, currentStepIndex } = useMemo(() => {
    const currentStepIndex = transactionSteps.findIndex(
      (step) => step.status !== TransactionStatus.SUCCESS
    );
    return {
      currentStep: transactionSteps[currentStepIndex],
      currentStepIndex,
    };
  }, [transactionSteps]);

  const value = useMemo(
    () => ({
      transactionSteps,
      transactionStepsLoading,
      transactionStepsError,
      handleChangeStatus,
      currentStep,
      currentStepIndex,
    }),
    [
      transactionSteps,
      transactionStepsLoading,
      transactionStepsError,
      handleChangeStatus,
      currentStep,
      currentStepIndex,
    ]
  );

  return (
    <TransactionStepsContext.Provider value={value}>
      {children}
    </TransactionStepsContext.Provider>
  );
};
