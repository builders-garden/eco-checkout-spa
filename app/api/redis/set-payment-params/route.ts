import { setPaymentParams } from "@/lib/redis/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { paymentParams } = await request.json();

  if (!paymentParams) {
    return NextResponse.json(
      { error: "Payment params are required" },
      { status: 400 }
    );
  }

  try {
    const paymentId = await setPaymentParams(paymentParams);
    return NextResponse.json(paymentId, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error setting payment params" },
      { status: 500 }
    );
  }
}
