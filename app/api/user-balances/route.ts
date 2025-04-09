import { env } from "@/lib/zod";
import { NextRequest, NextResponse } from "next/server";
import ky from "ky";
import { Chain, RelayoorResponse, Token } from "@/lib/relayoor/types";
import { UserAsset } from "@/lib/types";
import { TokenDecimals } from "@/lib/enums";
import { validTokens, validChains } from "@/lib/constants";

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
    const userBalances: UserAsset[] = Object.keys(response.data)
      .flatMap((chain) => {
        if (!validChains.includes(chain as Chain)) return undefined;
        return response.data[chain as Chain].map((balance) => {
          if (validTokens.includes(balance.token)) {
            return {
              asset: balance.token,
              amount: Number(balance.amount),
              chain: chain as Chain,
              decimals: TokenDecimals[balance.token],
            };
          }
        });
      })
      .filter((balance) => balance !== undefined);

    return NextResponse.json(userBalances, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch balances" },
      { status: 500 }
    );
  }
};
