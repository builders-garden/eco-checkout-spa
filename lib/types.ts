import { Abi, Hex } from "viem";
import { PaymentPageState } from "./enums";
import {
  RoutesSupportedChainId,
  RoutesSupportedStable,
} from "@eco-foundation/routes-sdk";

export type UserAssetsByAsset = Record<string, UserAsset[]>;

export type UserAsset = {
  asset: string;
  amount: number;
  humanReadableAmount: string;
  chain: string;
  chainId: number;
  tokenContractAddress: Hex;
  decimals: number;
  isTokenAtRisk: boolean;
  hasPermit: boolean;
  permit3Allowance: string;
};

export type GroupedTokens = Record<
  string,
  { assetName: string; chain: string }[]
>;

export type TransferInfo = {
  description: string;
  txLink: string | null;
  chain: string;
  tokens: { asset: string }[];
};

export type GroupedInvolvedTokensByChainId = {
  [key: string]: TransferInfo;
};

export type CheckoutPageStateType = {
  current: PaymentPageState | null;
  previous: PaymentPageState | null;
};

export type PaginationState = {
  currentPage: number;
  previousPage: number;
};

export type PaymentParams = {
  recipient: string | null;
  amountDue: string | null;
  desiredNetworkId: string | null;
  desiredToken: string | null;
  redirect: string | null;
  showFees: string | null;
};

export type ValidatedPaymentParams = {
  recipient: Hex | null;
  amountDue: number | null;
  desiredNetworkId: RoutesSupportedChainId | null;
  desiredToken: RoutesSupportedStable | null;
  redirect: string | null;
  showFees: boolean;
};

export type ContractParams = {
  abi: Abi;
  functionName: string;
  address: `0x${string}`;
  args: readonly unknown[];
  chainId: number;
};
