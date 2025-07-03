import { NextRequest, NextResponse } from "next/server";
import ky from "ky";
import { BalanceResponse } from "@/lib/relayoor/types";
import { UserAsset } from "@/lib/types";
import { TokenDecimals, TokenSymbols } from "@/lib/enums";
import {
  chainIdToChain,
  chainStringToChainId,
  getHumanReadableAmount,
  getViemPublicClient,
} from "@/lib/utils";
import {
  RoutesService,
  RoutesSupportedStable,
  stables as ecoSupportedTokens,
  chainIds as ecoSupportedChains,
  RoutesSupportedChainId,
} from "@eco-foundation/routes-sdk";
import { Address, Chain, erc20Abi, Hex, maxUint256, maxUint32 } from "viem";
import { PERMIT3_VERIFIER_ADDRESS } from "@/lib/constants";
import { env } from "@/lib/zod";

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
        `${env.NEXT_PUBLIC_RELAYOOR_BASE_URL}/api/v1/buildersGarden/balances?address=${userAddress}&includeNativeBalance=false`
      )
      .json<BalanceResponse>();

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

          const balances = await Promise.all(
            response.data[chain as string].map(async (balance) => {
              // If the token is not in the valid tokens array, return undefined
              if (!validTokens.includes(balance.token.toLowerCase()))
                return undefined;

              // Get the token decimals
              const decimals =
                TokenDecimals[balance.token as keyof typeof TokenDecimals];

              // Get the token amount raw
              const amount = Number(balance.amount);

              // If on the same chain, check if the token is the desired token
              // if not, return undefined (prevents swaps)
              if (chain === desiredNetwork && balance.token !== desiredToken) {
                return undefined;
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

              // Get the viem public client for the chain
              const publicClient = getViemPublicClient(
                chainIdToChain(chainId) as Chain
              );

              // Get the allowance of the token for the user
              let allowance: bigint = BigInt(0);
              try {
                allowance = await publicClient.readContract({
                  address: tokenContractAddress,
                  abi: erc20Abi,
                  functionName: "allowance",
                  args: [userAddress as Address, PERMIT3_VERIFIER_ADDRESS],
                });
              } catch (error) {
                console.log("Error: ", error);
                allowance = BigInt(0);
              }

              // Return the balance filled with the allowance for permit3
              return {
                asset: balance.token,
                amount,
                humanReadableAmount: getHumanReadableAmount(amount, decimals),
                isTokenAtRisk:
                  chainId !== desiredNetworkId &&
                  (chainId === 1 || desiredNetworkId === 1),
                chain: chain,
                tokenContractAddress,
                decimals,
                hasPermit: !(allowance < maxUint256 - maxUint32),
                permit3Allowance: Number(allowance).toString(),
              };
            })
          );

          return balances.filter(
            (balance): balance is UserAsset => balance !== undefined
          );
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
