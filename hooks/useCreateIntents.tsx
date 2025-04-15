import {
  RoutesService,
  CreateIntentParams,
  RoutesSupportedChainId,
  RoutesSupportedStable,
} from "@eco-foundation/routes-sdk";
import { encodeFunctionData, erc20Abi, Hex } from "viem";
import { chainStringToChainId } from "@/lib/utils";
import { useMemo } from "react";
import { UserAsset } from "@/lib/types";
import { useAppKitAccount } from "@reown/appkit/react";
import { EMPTY_ADDRESS } from "@/lib/constants";
import { TokenSymbols } from "@/lib/enums";
import { Token } from "@/lib/relayoor/types";

interface UseCreateIntentsProps {
  selectedTokens: UserAsset[];
  destinationChainID: number;
  recipient: Hex;
  desiredToken: string;
}

export const useCreateIntents = ({
  selectedTokens,
  destinationChainID,
  recipient,
  desiredToken,
}: UseCreateIntentsProps) => {
  const { address } = useAppKitAccount();

  // Group tokens by chain
  const tokensByChain = selectedTokens.reduce((acc, token) => {
    const chain = token.chain;
    if (!acc[chain]) {
      acc[chain] = [];
    }
    acc[chain].push(token);
    return acc;
  }, {} as Record<string, UserAsset[]>);

  const intents: CreateIntentParams[] = useMemo(() => {
    const intents: CreateIntentParams[] = [];
    // For each chain, create the intent using all tokens on that chain
    Object.entries(tokensByChain).forEach(([sourceChain, tokens]) => {
      // Get the total amount of tokens on the chain
      const totalAmountOnChain = tokens.reduce(
        (acc, token) => acc + BigInt(token.amount * 10 ** token.decimals),
        BigInt(0)
      );

      // Get the desired token address of the receiving chain
      const desiredTokenAddress = RoutesService.getStableAddress(
        destinationChainID as RoutesSupportedChainId,
        desiredToken as RoutesSupportedStable
      );

      // create calls by encoding transfer function data
      const calls = [
        {
          target: desiredTokenAddress,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: "transfer",
            args: [recipient, totalAmountOnChain],
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
            chainStringToChainId(sourceToken.chain) as RoutesSupportedChainId,
            TokenSymbols[sourceToken.asset as Token]
          ) as Hex,
          amount: BigInt(sourceToken.amount * 10 ** sourceToken.decimals),
        });
      });

      // Return the intent
      intents.push({
        creator: (address ?? EMPTY_ADDRESS) as Hex,
        originChainID: chainStringToChainId(
          sourceChain
        ) as RoutesSupportedChainId,
        destinationChainID: destinationChainID as RoutesSupportedChainId,
        calls,
        callTokens,
        tokens: sourceTokens,
        prover: "StorageProver",
      });
    });

    return intents;
  }, [selectedTokens]);

  return {
    intents,
  };
};
