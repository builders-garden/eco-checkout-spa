import { Hex } from "viem";
import {
  RoutesSupportedChainId,
  RoutesSupportedStable,
  stables,
  chainIds,
  RoutesService,
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
  static validateToken(
    token: string | null,
    networkId: string | null
  ): RoutesSupportedStable {
    if (stables.includes(token as RoutesSupportedStable)) {
      try {
        const validatedNetworkId = this.validateNetwork(networkId);
        if (!validatedNetworkId) return "USDC";
        RoutesService.getStableAddress(
          validatedNetworkId,
          token as RoutesSupportedStable
        );
        return token as RoutesSupportedStable;
      } catch (error) {
        return "USDC";
      }
    }
    return "USDC";
  }

  static validateRedirect(redirect: string | null): string | null {
    return redirect ? redirect : ""; // TODO: Decide what to do with empty redirects
  }

  static validatePaymentParams(
    paymentParams: PaymentParams
  ): ValidatedPaymentParams {
    return {
      recipient: this.validateRecipient(paymentParams.recipient),
      amountDue: this.validateAmount(paymentParams.amountDue),
      desiredNetworkId: this.validateNetwork(paymentParams.desiredNetworkId),
      desiredToken: this.validateToken(
        paymentParams.desiredToken,
        paymentParams.desiredNetworkId
      ),
      redirect: this.validateRedirect(paymentParams.redirect),
    };
  }
}
