import { GetIntentResponse } from "@/lib/relayoor/types";
import { env } from "@/lib/zod";
import ky from "ky";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const { requestID, creator } = await req.json();

  // Validate the parameters
  if (!requestID || !creator) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  // Get the dAppID from the environment variables
  const dAppID = env.NEXT_PUBLIC_ECO_DAPP_ID;

  let hashArray: {
    chainId: number;
    transactionHash: string;
  }[] = [];

  // Get the specific intent from the API
  try {
    const { data } = await ky
      .get<GetIntentResponse>(
        `${env.NEXT_PUBLIC_QUOTES_BASE_URL}/api/v1/intents?dAppID=${dAppID}&intentGroupID=${requestID}&creator=${creator}`
      )
      .json();

    for (const intent of data) {
      hashArray.push({
        chainId: intent.chainId,
        transactionHash: intent.transactionHash,
      });
    }

    return NextResponse.json({ hashArray }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to get intent" },
      { status: 500 }
    );
  }
};
