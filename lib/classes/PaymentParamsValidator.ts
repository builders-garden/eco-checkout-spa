import { Hex } from "viem";
import {
  RoutesSupportedChainId,
  RoutesSupportedStable,
  stables,
  chainIds,
  RoutesService,
} from "@eco-foundation/routes-sdk";
import { PaymentParams, ValidatedPaymentParams } from "../types";
import { getAddressFromEns } from "../names/ens";

export class PaymentParamsValidator {
  // Recipient must be a valid Ethereum address
  static async validateRecipient(
    recipient: string | null
  ): Promise<Hex | null> {
    if (!recipient) return null;

    // check if the recipient is an ENS domain
    const recipientAddress = await getAddressFromEns(recipient);
    if (recipientAddress) {
      console.log("recipientAddress", recipientAddress);
      return recipientAddress as Hex;
    }

    if (
      typeof recipient !== "string" ||
      !/^0x[a-fA-F0-9]{40}$/.test(recipient)
    ) {
      return null;
    }
    return recipient as Hex;
  }

  // Amount must be a positive number with up to 2 decimal places
  static validateAmount(amount: string | null): number | null {
    if (!amount) return null;
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return null;
    }
    const amountWithoutDecimals = Math.round(Number(amount) * 100) / 100;
    return amountWithoutDecimals;
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
    return redirect ? redirect : "";
  }

  static validateShowFees(showFees: string | null): boolean {
    return showFees === "true" ? true : false;
  }

  static async validatePaymentParams(
    paymentParams: PaymentParams
  ): Promise<ValidatedPaymentParams> {
    return {
      recipient: await this.validateRecipient(paymentParams.recipient),
      amountDue: this.validateAmount(paymentParams.amountDue),
      desiredNetworkId: this.validateNetwork(paymentParams.desiredNetworkId),
      desiredToken: this.validateToken(
        paymentParams.desiredToken,
        paymentParams.desiredNetworkId
      ),
      redirect: this.validateRedirect(paymentParams.redirect),
      showFees: this.validateShowFees(paymentParams.showFees),
    };
  }
}
