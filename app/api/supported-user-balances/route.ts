import { env } from "@/lib/zod";
import { NextRequest, NextResponse } from "next/server";
import ky from "ky";
import { RelayoorChain, RelayoorResponse } from "@/lib/relayoor/types";
import { UserAsset } from "@/lib/types";
import { TokenDecimals, TokenSymbols } from "@/lib/enums";
import { chainStringToChainId } from "@/lib/utils";
import {
  RoutesService,
  RoutesSupportedStable,
  stables as ecoSupportedTokens,
  chainIds as ecoSupportedChains,
  RoutesSupportedChainId,
} from "@eco-foundation/routes-sdk";
import { Hex } from "viem";
import { MIN_MAINNET_PROTOCOL_FEE } from "@/lib/constants";

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const userAddress = searchParams.get("userAddress");
  const amountDue = Number(searchParams.get("amountDue"));
  const desiredNetwork = searchParams.get("desiredNetwork");
  const desiredToken = searchParams.get("desiredToken")?.toLowerCase();

  // Check if the desired network is provided
  if (!desiredNetwork) {
    return NextResponse.json(
      { error: "Desired network is required" },
      { status: 400 }
    );
  }

  // Check if the user address is provided
  if (!userAddress) {
    return NextResponse.json(
      { error: "User address is required" },
      { status: 400 }
    );
  }

  // Check if the amount due is provided and is a number greater than 0
  if (!amountDue || isNaN(amountDue) || amountDue <= 0) {
    return NextResponse.json(
      { error: "Amount due is required and must be a number greater than 0" },
      { status: 400 }
    );
  }

  // Check if the desired network is a valid chain
  let desiredNetworkId: RoutesSupportedChainId | null = null;
  try {
    desiredNetworkId = chainStringToChainId(desiredNetwork);
  } catch (error) {
    return NextResponse.json(
      { error: "Desired network is invalid" },
      { status: 400 }
    );
  }

  // Get an array of valid tokens all lowercase for comparison purposes
  const validTokens = ecoSupportedTokens.map((token) => token.toLowerCase());

  // Check if the desired token is provided and is a valid token
  if (!desiredToken || !validTokens.includes(desiredToken)) {
    return NextResponse.json(
      { error: "Desired token is invalid" },
      { status: 400 }
    );
  }

  try {
    const response = await ky
      .get(
        `${env.NEXT_PUBLIC_RELAYOOR_BASE_URL}/intents/balances?address=${userAddress}&includeNativeBalance=false`
      )
      .json<RelayoorResponse>();

    // Reduce the data from RelayoorResponse to an array of assets
    const userBalances: UserAsset[] = (
      await Promise.all(
        Object.keys(response.data).map(async (chain) => {
          // Get the chain id, if the chain is not supported, return an empty array
          let chainId: RoutesSupportedChainId | null = null;
          try {
            chainId = chainStringToChainId(chain);
          } catch (error) {
            return [];
          }

          // Check if the chain is supported
          if (!ecoSupportedChains.includes(chainId)) return [];

          return response.data[chain as RelayoorChain]
            .map((balance) => {
              // If the token is not in the valid tokens array, return undefined
              if (!validTokens.includes(balance.token.toLowerCase()))
                return undefined;

              // Get the token decimals
              const decimals = TokenDecimals[balance.token];

              // Get the token amount rounded to 2 decimal places
              const amount =
                Math.floor(Number(balance.amount) / 10 ** (decimals - 2)) / 100;

              // If the token amount is less than the base protocol fee on L1 by 2x, return undefined
              if (amount < MIN_MAINNET_PROTOCOL_FEE * 2) return undefined;

              // If one the same chain, check if the token is the desired token
              // if not, return undefined (prevents swaps)
              if (chain === desiredNetwork && balance.token !== desiredToken) {
                return undefined;
              }

              // If the chain is not the desired network, check if one of the two is mainnet
              // and if so, check if the amount due is less than the base protocol fee
              // This prevents the merchant from receiving 0 tokens and intent creation to fail
              if (chainId !== desiredNetworkId) {
                if (
                  (chainId === 1 || desiredNetworkId === 1) &&
                  amountDue < MIN_MAINNET_PROTOCOL_FEE
                ) {
                  return undefined;
                }
              }

              // Get the token address
              let tokenContractAddress: Hex | null = null;
              try {
                tokenContractAddress = RoutesService.getStableAddress(
                  chainId,
                  TokenSymbols[
                    balance.token.toLowerCase() as keyof typeof TokenSymbols
                  ] as RoutesSupportedStable
                );
              } catch (error) {
                // Token is not supported for this chain
                return undefined;
              }

              return {
                asset: balance.token,
                amount,
                isTokenAtRisk:
                  chainId !== desiredNetworkId &&
                  (chainId === 1 || desiredNetworkId === 1),
                chain: chain as RelayoorChain,
                tokenContractAddress,
                decimals,
              };
            })
            .filter((balance): balance is UserAsset => balance !== undefined);
        })
      )
    ).flat();

    return NextResponse.json(userBalances, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch balances" },
      { status: 500 }
    );
  }
};
