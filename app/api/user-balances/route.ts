import { env } from "@/lib/zod";
import { NextRequest, NextResponse } from "next/server";
import ky from "ky";
import { RelayoorResponse } from "@/lib/relayoor/types";

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

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch balances" },
      { status: 500 }
    );
  }
};
