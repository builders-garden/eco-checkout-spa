import {
  RoutesService,
  selectCheapestQuote,
  OpenQuotingClient,
  CreateSimpleIntentParams,
  RoutesSupportedChainId,
} from "@eco-foundation/routes-sdk";
import { IntentType } from "@eco-foundation/routes-ts";
import { Hex } from "viem";
import { chainStringToChainId } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { EMPTY_ADDRESS } from "@/lib/constants";
import { TokenSymbols } from "@/lib/enums";
import { Token } from "@/lib/relayoor/types";
import { useSelectedTokens } from "@/components/providers/selected-tokens-provider";
import { usePaymentParams } from "@/components/providers/payment-params-provider";

const routesService = new RoutesService();
const openQuotingClient = new OpenQuotingClient({ dAppID: "eco-dapp" });

export const useCreateSimpleIntents = () => {
  const { selectedTokens } = useSelectedTokens();
  const { paymentParams } = usePaymentParams();

  const [optimizedIntents, setOptimizedIntents] = useState<IntentType[]>([]);
  const [optimizedIntentsLoading, setOptimizedIntentsLoading] =
    useState<boolean>(false);
  const [intents, setIntents] = useState<IntentType[]>([]);
  const { address } = useAppKitAccount();

  // UseEffect to create intents
  useEffect(() => {
    const createdIntents: IntentType[] = [];
    // Create a simple intent for each token
    for (const token of selectedTokens) {
      // Get the origin chain ID
      const originChainID = chainStringToChainId(
        token.chain
      ) as RoutesSupportedChainId;

      // Get the spending token address
      const spendingToken = RoutesService.getStableAddress(
        originChainID,
        TokenSymbols[token.asset.toLowerCase() as Token]
      ) as Hex;

      // Get the receiving token address
      const receivingToken = RoutesService.getStableAddress(
        paymentParams.desiredNetworkId!,
        TokenSymbols[paymentParams.desiredToken!.toLowerCase() as Token]
      ) as Hex;

      // Get the amount and limit of tokens to spend
      const amount = BigInt(token.amount * 10 ** token.decimals);
      const limit = amount + BigInt(1 * 10 ** 6);

      // Create the intent params
      const intentParams: CreateSimpleIntentParams = {
        creator: (address ?? EMPTY_ADDRESS) as Hex,
        originChainID: originChainID,
        spendingToken: spendingToken,
        amount: amount,
        destinationChainID: paymentParams.desiredNetworkId!,
        recipient: paymentParams.recipient!,
        receivingToken: receivingToken,
        prover: "HyperProver",
        spendingTokenLimit: limit,
      };

      if (intentParams.originChainID !== paymentParams.desiredNetworkId!) {
        const intent = routesService.createSimpleIntent(intentParams);
        createdIntents.push(intent);
      }
    }

    setIntents(createdIntents);
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
