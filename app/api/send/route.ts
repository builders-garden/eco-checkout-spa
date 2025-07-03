import { SendResponse } from "@/lib/relayoor/types";
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

  // Validate the parameters
  if (
    !sender ||
    !recipient ||
    !destinationToken ||
    !transferAmount ||
    !destinationNetwork
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
      .post<SendResponse>(
        `${env.NEXT_PUBLIC_RELAYOOR_BASE_URL}/api/v1/buildersGarden/send`,
        {
          json: requestBody,
          timeout: false,
        }
      )
      .json();

    return NextResponse.json(
      {
        signatureData: response.data.permit3SignatureData,
        requestID: response.data.requestID,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to get optimized selection" },
      { status: 500 }
    );
  }
};
