import { GetIntentResponse } from "@/lib/relayoor/types";
import { env } from "@/lib/zod";
import ky from "ky";
import { NextRequest, NextResponse } from "next/server";

interface GetIntentsParams {
  quoteID: string;
}

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<GetIntentsParams> }
) => {
  const { searchParams } = new URL(req.url);

  // Get the creator address from the URL
  const creator = searchParams.get("creator");

  const { quoteID } = await params;

  // Validate the parameters
  if (!quoteID || !creator) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  // Get the dAppID from the environment variables
  const dAppID = env.NEXT_PUBLIC_ECO_DAPP_ID;

  // Get the specific intent from the API
  try {
    const response = await ky
      .get<GetIntentResponse>(
        // TODO: Change with env variable
        `https://quotes.ngrok.app/api/v1/intents?dAppID=${dAppID}&quoteID=${quoteID}&creator=${creator}`
      )
      .json();

    // Get the destination token address
    const destinationTokenAddress =
      response.data[0].v2GaslessIntentData.permitData.permit3.allowanceOrTransfers.find(
        (transfer) =>
          transfer.chainID.toString() === response.data[0].params.destination
      )?.token;

    return NextResponse.json(
      { response: response, destinationTokenAddress },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to get intent" },
      { status: 500 }
    );
  }
};
