import { TokenSymbols } from "@/lib/enums";
import { GetTransfersResponse, SendResponse } from "@/lib/relayoor/types";
import { UserAsset } from "@/lib/types";
import { chainIdToChain, chainStringToChainId } from "@/lib/utils";
import { env } from "@/lib/zod";
import ky from "ky";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  // Get the parameters from the URL
  const sender = searchParams.get("sender");
  const recipient = searchParams.get("recipient");
  const destinationNetwork = searchParams.get("destinationNetwork");
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
    destinationNetwork: destinationNetwork.toUpperCase(),
    destinationToken,
    transferAmount,
    requestedTransfers: [],
  };

  // Get the destination chain id from the destination network
  const destinationChainId = chainStringToChainId(destinationNetwork);

  try {
    const response = await ky
      .post<SendResponse>(
        `${env.NEXT_PUBLIC_RELAYOOR_BASE_URL}/api/v1/buildersGarden/send`,
        {
          json: requestBody,
        }
      )
      .json();

    // Get all the allowances and transfers from the response
    const { allowanceOrTransfers } = response.data.permit3SignatureData;

    // Get the userBalances that are corresponding to the tokens returned by the API
    let optimizedSelection: UserAsset[] = [];

    // Get the userBalance that is corresponding to the destination token
    let sameChainToken: UserAsset | null = null;

    allowanceOrTransfers.forEach((token) => {
      for (const balance of userBalances) {
        if (
          balance.tokenContractAddress.toLowerCase() ===
          token.token.toLowerCase()
        ) {
          if (token.chainID === destinationChainId) {
            sameChainToken = balance;
          } else {
            optimizedSelection.push(balance);
          }
        }
      }
    });

    // Sort the optimized selection by amount (descending)
    optimizedSelection = [...optimizedSelection].sort((a, b) => {
      return a.amount - b.amount;
    });

    // If the amount of the optimized selection is less than the transfer amount
    // add the same chain token at the end
    if (
      optimizedSelection.reduce((acc, curr) => acc + curr.amount, 0) <
      Number(transferAmount)
    ) {
      if (sameChainToken) {
        optimizedSelection.push(sameChainToken);
      }
    }

    return NextResponse.json(optimizedSelection, { status: 200 });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json(
      { error: "Failed to get optimized selection" },
      { status: 500 }
    );
  }
};
