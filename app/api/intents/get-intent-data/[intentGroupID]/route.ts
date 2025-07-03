import { GetIntentDataResponse } from "@/lib/relayoor/types";
import ky from "ky";
import { NextRequest, NextResponse } from "next/server";

interface GetIntentsParams {
  intentGroupID: string;
}

export const GET = async (
  _: NextRequest,
  { params }: { params: Promise<GetIntentsParams> }
) => {
  const { intentGroupID } = await params;

  // Validate the parameter
  if (!intentGroupID) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  // Get the specific intent from the API
  try {
    const response = await ky
      .post<GetIntentDataResponse>(
        // TODO: Change with env variable
        `https://quotes.ngrok.app/api/v2/quotes/getGaslessIntentTransactionData`,
        {
          json: {
            intentGroupID,
          },
        }
      )
      .json();

    console.log("response", JSON.stringify(response, null, 2));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to get intent" },
      { status: 500 }
    );
  }
};
