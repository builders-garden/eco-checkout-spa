import {
  RoutesService,
  CreateIntentParams,
  RoutesSupportedChainId,
  selectCheapestQuote,
  OpenQuotingClient,
} from "@eco-foundation/routes-sdk";
import { IntentType } from "@eco-foundation/routes-ts";
import { encodeFunctionData, erc20Abi, Hex } from "viem";
import { chainStringToChainId } from "@/lib/utils";
import { useEffect, useState } from "react";
import { UserAsset } from "@/lib/types";
import { useAppKitAccount } from "@reown/appkit/react";
import { TokenSymbols } from "@/lib/enums";
import { Token } from "@/lib/relayoor/types";
import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { useSelectedTokens } from "@/components/providers/selected-tokens-provider";

const routesService = new RoutesService();
const openQuotingClient = new OpenQuotingClient({ dAppID: "eco-dapp" });

export const useCreateIntents = () => {
  const { selectedTokens } = useSelectedTokens();
  const { paymentParams, areAllPaymentParamsValid } = usePaymentParams();
  const { address } = useAppKitAccount();
  const [optimizedIntents, setOptimizedIntents] = useState<IntentType[]>([]);
  const [optimizedIntentsLoading, setOptimizedIntentsLoading] =
    useState<boolean>(false);
  const [intents, setIntents] = useState<IntentType[]>([]);

  // Group tokens by chain
  const tokensByChain = selectedTokens.reduce((acc, token) => {
    const chain = token.chain;
    if (!acc[chain]) {
      acc[chain] = [];
    }
    acc[chain].push(token);
    return acc;
  }, {} as Record<string, UserAsset[]>);

  // UseEffect to create intents
  useEffect(() => {
    if (!areAllPaymentParamsValid || !address) return;
    const intentsParams: CreateIntentParams[] = [];
    // For each chain, create the intent params using all tokens on that chain
    Object.entries(tokensByChain).forEach(([sourceChain, tokens]) => {
      // Get the total amount of tokens on the chain
      const totalAmountOnChain = tokens.reduce(
        (acc, token) => acc + BigInt(token.amount * 10 ** token.decimals),
        BigInt(0)
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
            args: [paymentParams.recipient!, totalAmountOnChain],
          }),
          value: BigInt(0),
        },
      ];

      // create callTokens based on your calls
      const callTokens = [
        {
          token: desiredTokenAddress,
          amount: totalAmountOnChain,
        },
      ];

      // Create the source tokens array
      const sourceTokens: {
        token: Hex;
        amount: bigint;
      }[] = [];
      tokens.forEach((sourceToken) => {
        sourceTokens.push({
          token: RoutesService.getStableAddress(
            chainStringToChainId(sourceToken.chain) as RoutesSupportedChainId, // TODO: Wait for a solution from Eco on missing Mantle chainId (5000)
            TokenSymbols[sourceToken.asset as Token]
          ) as Hex,
          amount: BigInt(sourceToken.amount * 10 ** sourceToken.decimals),
        });
      });

      // Return the intent
      intentsParams.push({
        creator: address as Hex,
        originChainID: chainStringToChainId(
          sourceChain
        ) as RoutesSupportedChainId,
        destinationChainID: paymentParams.desiredNetworkId!,
        calls,
        callTokens,
        tokens: sourceTokens,
        prover: "HyperProver", // TODO: Check this, because StorageProver is not working for some chains
        expiryTime: new Date(Date.now() + 1000 * 60 * 30), // 30 minutes
      });
    });

    // TODO: Provisional solution to avoid creating intents for the same chain
    const filteredIntents = intentsParams.filter(
      (intentParam) =>
        intentParam.originChainID !== paymentParams.desiredNetworkId!
    );

    const intents = filteredIntents.map((intentParam) => {
      return routesService.createIntent(intentParam);
    });

    setIntents(intents);
  }, [selectedTokens]);

  // UseEffect to get optimized intents
  useEffect(() => {
    const getOptimizedIntents = async () => {
      setOptimizedIntentsLoading(true);
      try {
        let optimizedIntents: IntentType[] = [];
        for (const intent of intents) {
          const quotes = await openQuotingClient.requestQuotesForIntent(intent);

          // select the cheapest quote
          const selectedQuote = selectCheapestQuote(quotes);

          // apply quote to intent
          const intentWithQuote = routesService.applyQuoteToIntent({
            intent,
            quote: selectedQuote,
          });

          // add the optimized intent to the array
          optimizedIntents.push(intentWithQuote);
        }

        // set the optimized intents
        setOptimizedIntents(optimizedIntents);
      } catch (error) {
        console.error("Quotes not available", error);
      } finally {
        setOptimizedIntentsLoading(false);
      }
    };
    getOptimizedIntents();
  }, [intents]);

  return {
    intents,
    optimizedIntents,
    optimizedIntentsLoading,
  };
};
