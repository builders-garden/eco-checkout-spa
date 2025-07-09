import { SendResponse } from "@/lib/relayoor/types";
import { UserAsset } from "@/lib/types";
import { chainStringToChainId } from "@/lib/utils";
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

    // Calculate the amount received by the recipient from the different chains
    const totalAmountReceivedFromDifferentChains = response.data.intents.reduce(
      (acc, intent) => {
        const { tokens } = intent.routeData;
        const amountReceived = tokens.reduce(
          (acc, token) => acc + Number(token.amount),
          0
        );
        return acc + amountReceived;
      },
      0
    );

    // If the amount received by the recipient from the different chains is less than the transfer amount
    // add the same chain token at the end of the optimized selection
    if (totalAmountReceivedFromDifferentChains < Number(transferAmount)) {
      if (sameChainToken) {
        optimizedSelection.push(sameChainToken);
      }
    }

    // Get the requestID and permit3SignatureData from the response
    const { requestID, permit3SignatureData, intents } = response.data;

    return NextResponse.json(
      {
        optimizedSelection,
        requestID,
        permit3SignatureData,
        allowanceOrTransfers,
        intents,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error: ", error);
    return NextResponse.json(
      { error: "Failed to get optimized selection" },
      { status: 500 }
    );
  }
};
