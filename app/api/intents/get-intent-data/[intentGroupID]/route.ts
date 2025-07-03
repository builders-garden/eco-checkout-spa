import { GetIntentDataResponse } from "@/lib/relayoor/types";
import { env } from "@/lib/zod";
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
        `${env.NEXT_PUBLIC_QUOTES_BASE_URL}/api/v2/quotes/getGaslessIntentTransactionData`,
        {
          json: {
            intentGroupID,
          },
        }
      )
      .json();

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to get intent" },
      { status: 500 }
    );
  }
};
