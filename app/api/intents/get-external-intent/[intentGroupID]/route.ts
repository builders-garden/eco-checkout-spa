import { GetIntentResponse, IntentData } from "@/lib/relayoor/types";
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
  // Get the intentGroupID from the params
  const { intentGroupID } = await params;

  // Validate the parameters
  if (!intentGroupID) {
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
        `${env.NEXT_PUBLIC_QUOTES_BASE_URL}/api/v1/intents?dAppID=${dAppID}&intentGroupID=${intentGroupID}`
      )
      .json();

    // Group the intents by intentGroupID
    const groupedIntents = response.data.reduce((acc, intent) => {
      acc[intent.intentGroupID] = acc[intent.intentGroupID] || [];
      acc[intent.intentGroupID].push(intent);
      return acc;
    }, {} as Record<string, IntentData[]>);

    return NextResponse.json(groupedIntents, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to get intent" },
      { status: 500 }
    );
  }
};
