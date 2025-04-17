import { Hex } from "viem";
import {
  RoutesSupportedChainId,
  RoutesSupportedStable,
  stables,
  chainIds,
} from "@eco-foundation/routes-sdk";
import { PaymentParams, ValidatedPaymentParams } from "../types";

export class PaymentParamsValidator {
  // Recipient must be a valid Ethereum address
  static validateRecipient(recipient: string | null): Hex | null {
    if (!recipient) return null;
    if (
      typeof recipient !== "string" ||
      !/^0x[a-fA-F0-9]{40}$/.test(recipient)
    ) {
      return null;
    }
    return recipient as Hex;
  }

  // Amount must be a positive number
  static validateAmount(amount: string | null): number | null {
    if (!amount) return null;
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return null;
    }
    return Number(amount);
  }

  // Network must be a valid chain ID
  static validateNetwork(
    network: string | null
  ): RoutesSupportedChainId | null {
    if (!network || isNaN(Number(network))) return null;
    const networkId = Number(network);
    return chainIds.includes(networkId as RoutesSupportedChainId)
      ? (networkId as RoutesSupportedChainId)
      : null;
  }

  // Token must be included in the list of supported tokens (RoutesSupportedStable)
  static validateToken(token: string | null): RoutesSupportedStable {
    return stables.includes(token as RoutesSupportedStable)
      ? (token as RoutesSupportedStable)
      : "USDC";
  }

  static validateRedirect(redirect: string | null): string | null {
    return redirect ? redirect : "empty-redirect"; // TODO: Decide what to do with empty redirects
  }

  static validatePaymentParams(
    paymentParams: PaymentParams
  ): ValidatedPaymentParams {
    return {
      recipient: this.validateRecipient(paymentParams.recipient),
      amountDue: this.validateAmount(paymentParams.amountDue),
      desiredNetworkId: this.validateNetwork(paymentParams.desiredNetworkId),
      desiredToken: this.validateToken(paymentParams.desiredToken),
      redirect: this.validateRedirect(paymentParams.redirect),
    };
  }
}
