import { GetIntentResponse } from "@/lib/relayoor/types";
import { env } from "@/lib/zod";
import ky from "ky";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const { quoteIDs, creator } = await req.json();

  // Validate the parameters
  if (!quoteIDs || !creator) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  // Get the dAppID from the environment variables
  const dAppID = env.NEXT_PUBLIC_ECO_DAPP_ID;

  let quoteIDsArray: {
    response: GetIntentResponse;
    destinationTokenAddress: string | undefined;
  }[] = [];

  // Get the specific intent from the API
  try {
    for (const quoteID of quoteIDs) {
      const response = await ky
        .get<GetIntentResponse>(
          `${env.NEXT_PUBLIC_RELAYOOR_BASE_URL}/intents?dAppID=${dAppID}&quoteID=${quoteID}&creator=${creator}`
        )
        .json();

      // Get the destination token address
      const destinationTokenAddress =
        response.data[0].v2GaslessIntentData.permitData.permit3.allowanceOrTransfers.find(
          (transfer) =>
            transfer.chainID.toString() === response.data[0].params.destination
        )?.token;

      quoteIDsArray.push({
        response,
        destinationTokenAddress,
      });
    }

    return NextResponse.json({ quoteIDsArray }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to get intent" },
      { status: 500 }
    );
  }
};
