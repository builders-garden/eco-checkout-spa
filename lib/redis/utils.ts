import { redisClient } from ".";
import { PaymentParams } from "../types";
import bs58 from "bs58";

/**
 * Stable stringify an object
 * @param obj - The object to stringify
 * @returns A stable stringified object
 */
function stableStringify(obj: any): string {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    return (
      "{" +
      Object.keys(obj)
        .sort()
        .map((key) => `"${key}":${stableStringify(obj[key])}`)
        .join(",") +
      "}"
    );
  } else if (Array.isArray(obj)) {
    return "[" + obj.map(stableStringify).join(",") + "]";
  } else {
    return JSON.stringify(obj);
  }
}

/**
 * Generate a payment ID as a SHA-256 hash of the paymentParams object (Edge compatible)
 * @param paymentParams - The payment params
 * @returns A unique payment ID (hash)
 */
export async function generatePaymentId(
  paymentParams: PaymentParams
): Promise<string> {
  const str = stableStringify(paymentParams);
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  // Encode the full SHA-256 hash in base58 for compactness
  const hashArray = new Uint8Array(hashBuffer);
  return bs58.encode(hashArray);
}

/**
 * Get payment params from Redis
 * @param paymentId - The payment ID
 * @returns The payment params or null if the payment params cannot be retrieved
 */
export const getPaymentParams = async (
  paymentId: string
): Promise<PaymentParams | null> => {
  try {
    const paymentParams = await redisClient.get<PaymentParams>(
      `paymentParams:${paymentId}`
    );
    return paymentParams;
  } catch (error) {
    console.error("Error getting payment params from Redis", error);
    return null;
  }
};

/**
 * Set payment params in Redis
 * @param paymentParams - The payment params
 * @throws An error if the payment params cannot be set
 * @returns The generated payment ID
 */
export const setPaymentParams = async (
  paymentParams: PaymentParams
): Promise<string> => {
  try {
    const paymentId = await generatePaymentId(paymentParams);
    await redisClient.set(`paymentParams:${paymentId}`, paymentParams);
    return paymentId;
  } catch (error) {
    console.error("Error setting payment params in Redis", error);
    throw error;
  }
};
