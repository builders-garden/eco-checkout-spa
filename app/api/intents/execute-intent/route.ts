import { ExecuteIntentResponse } from "@/lib/relayoor/types";
import { env } from "@/lib/zod";
import ky from "ky";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  // Get the request Id and user signature
  const {
    requestID,
    userSignedMessage,
  }: { requestID: string; userSignedMessage: string } = await req.json();

  // Execute the intent
  try {
    const response = await ky
      .post<ExecuteIntentResponse>(
        `${env.NEXT_PUBLIC_RELAYOOR_BASE_URL}/buildersGarden/executeIntents`,
        {
          json: {
            requestID,
            permit3Signature: userSignedMessage,
          },
          timeout: false,
        }
      )
      .json();

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to execute intent" },
      { status: 500 }
    );
  }
};
