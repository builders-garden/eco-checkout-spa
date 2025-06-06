import { NextResponse, NextRequest } from "next/server";
import { getPaymentParams } from "@/lib/redis/utils";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathSegments = url.pathname.split("/").filter(Boolean);

  // If the first segment exists and is not a known route, treat it as an id
  if (pathSegments.length === 1 && pathSegments[0] !== "api") {
    const isHistory = pathSegments[0] === "history";
    if (!isHistory) {
      const id = pathSegments[0];
      const paymentParams = await getPaymentParams(id);
      if (paymentParams) {
        const newUrl = url.clone();
        newUrl.pathname = "/";
        Object.entries(paymentParams).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            const queryParamKey =
              key === "amountDue"
                ? "amount"
                : key === "desiredNetworkId"
                ? "network"
                : key === "desiredToken"
                ? "token"
                : key;
            newUrl.searchParams.set(queryParamKey, String(value));
          }
        });
        return NextResponse.redirect(newUrl);
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"],
};
