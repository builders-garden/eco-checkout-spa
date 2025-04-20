import { env } from "@/lib/zod";
import { NextRequest, NextResponse } from "next/server";
import ky from "ky";
import { Chain, RelayoorResponse } from "@/lib/relayoor/types";
import { UserAsset } from "@/lib/types";
import { TokenDecimals } from "@/lib/enums";
import { validTokens, validChains } from "@/lib/constants";
import { getGasPrice } from "@wagmi/core";
import { config } from "@/lib/appkit";
import {
  bigIntWeiToGwei,
  chainStringToChainId,
  getEstimatedFeeByChain,
} from "@/lib/utils";

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const userAddress = searchParams.get("userAddress");

  if (!userAddress) {
    return NextResponse.json(
      { error: "User address is required" },
      { status: 400 }
    );
  }

  try {
    const response = await ky
      .get(
        `${env.NEXT_PUBLIC_REOWN_BASE_URL}/intents/balances?address=${userAddress}&includeNativeBalance=false`
      )
      .json<RelayoorResponse>();

    // Reduce the data from RelayoorResponse to an array of assets
    const userBalances: UserAsset[] = (
      await Promise.all(
        Object.keys(response.data).map(async (chain) => {
          if (!validChains.includes(chain as Chain)) return [];

          let chainGasPrice: number | null = null;
          try {
            chainGasPrice = bigIntWeiToGwei(
              await getGasPrice(config, {
                chainId: chainStringToChainId(chain as Chain),
              })
            );
          } catch (error) {
            console.error(error);
          }

          const estimatedFee = getEstimatedFeeByChain(
            chainGasPrice ?? 0.5,
            chainStringToChainId(chain as Chain)
          );

          return response.data[chain as Chain]
            .map((balance) => {
              if (validTokens.includes(balance.token)) {
                const decimals = TokenDecimals[balance.token];
                const amount = Number(balance.amount) / 10 ** decimals;
                if (amount < estimatedFee) return undefined;
                return {
                  asset: balance.token,
                  amount,
                  spendableAmount: amount - estimatedFee,
                  estimatedFee,
                  chain: chain as Chain,
                  decimals,
                };
              }
            })
            .filter((balance): balance is UserAsset => balance !== undefined);
        })
      )
    ).flat();

    return NextResponse.json(userBalances, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch balances" },
      { status: 500 }
    );
  }
};
