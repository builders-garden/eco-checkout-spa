import { TokenSymbols } from "@/lib/enums";
import { GetTransfersResponse } from "@/lib/relayoor/types";
import { UserAsset } from "@/lib/types";
import { chainIdToChain } from "@/lib/utils";
import { env } from "@/lib/zod";
import ky from "ky";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  // Get the parameters from the URL
  const sender = searchParams.get("sender");
  const recipient = searchParams.get("recipient");
  const destinationNetwork = searchParams
    .get("destinationNetwork")
    ?.toUpperCase();
  const destinationToken = searchParams.get("destinationToken");
  const transferAmount = searchParams.get("transferAmount");

  // Get the user balances from the request body
  const { userBalances }: { userBalances: UserAsset[] } = await req.json();

  // Validate the parameters
  if (
    !sender ||
    !recipient ||
    !destinationToken ||
    !transferAmount ||
    !destinationNetwork ||
    !userBalances
  ) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  // Create the request body
  const requestBody = {
    dAppID: env.NEXT_PUBLIC_ECO_DAPP_ID,
    sender,
    recipient,
    destinationNetwork,
    destinationToken,
    transferAmount,
    requestedTransfers: [],
  };

  try {
    const response = await ky
      .post<GetTransfersResponse>(
        `${env.NEXT_PUBLIC_RELAYOOR_BASE_URL}/buildersGarden/getTransfers`,
        {
          json: requestBody,
        }
      )
      .json();

    // Get the userBalances that are corresponding to the tokens returned by the API
    let optimizedSelection: UserAsset[] = [];

    Object.values(response.data).forEach((tokens) => {
      for (const token of tokens) {
        for (const balance of userBalances) {
          let chainName: string;
          try {
            chainName = chainIdToChain(token.chainID, true) as string;
          } catch {
            continue;
          }
          if (
            balance.chain === chainName &&
            TokenSymbols[balance.asset as keyof typeof TokenSymbols] ===
              token.tokenSymbol
          ) {
            optimizedSelection.push({
              ...balance,
              amount: Number(token.amount),
              hasPermit: token.hasPermit,
              permit3Allowance: token.permit3Allowance,
            });
          }
        }
      }
    });

    optimizedSelection = [...optimizedSelection].sort((a, b) => {
      return a.amount - b.amount;
    });

    return NextResponse.json(optimizedSelection, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get optimized selection" },
      { status: 500 }
    );
  }
};
