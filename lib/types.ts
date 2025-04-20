import { Hex } from "viem";
import { PageState } from "./enums";
import { Chain, Token } from "./relayoor/types";
import {
  RoutesSupportedChainId,
  RoutesSupportedStable,
} from "@eco-foundation/routes-sdk";

export type UserAsset = {
  asset: Token;
  amount: number;
  spendableAmount: number;
  estimatedFee: number;
  chain: Chain;
  decimals: number;
};

export type GroupedTokens = Record<
  string,
  { assetName: string; chain: string }[]
>;

export type PageStateType = {
  current: PageState;
  previous: PageState | null;
};

export type PaymentParams = {
  recipient: string | null;
  amountDue: string | null;
  desiredNetworkId: string | null;
  desiredToken: string | null;
  redirect: string | null;
};

export type ValidatedPaymentParams = {
  recipient: Hex | null;
  amountDue: number | null;
  desiredNetworkId: RoutesSupportedChainId | null;
  desiredToken: RoutesSupportedStable | null;
  redirect: string | null;
};
