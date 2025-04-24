import { Hex } from "viem";
import { PageState, TransactionStatus } from "./enums";
import { RelayoorChain, RelayoorToken } from "./relayoor/types";
import {
  RoutesSupportedChainId,
  RoutesSupportedStable,
} from "@eco-foundation/routes-sdk";
import { IntentType } from "@eco-foundation/routes-ts";

export type UserAsset = {
  asset: RelayoorToken;
  amount: number;
  spendableAmount: number;
  estimatedFee: number;
  chain: RelayoorChain;
  tokenContractAddress: Hex;
  decimals: number;
};

export type TransactionAsset = {
  asset: RelayoorToken;
  chain: RelayoorChain;
  amountToSend: number;
  tokenContractAddress: Hex;
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

export type ApproveStep = {
  type: "approve";
  status: TransactionStatus;
  assets: TransactionAsset[];
  allowanceAmount: bigint;
  intentSourceContract: Hex;
};

export type TransferStep = {
  type: "transfer";
  status: TransactionStatus;
  assets: TransactionAsset[];
  to: Hex;
};

export type IntentStep = {
  type: "intent";
  status: TransactionStatus;
  assets: TransactionAsset[];
  intent: IntentType | null;
  intentSourceContract: Hex;
};

export type TransactionStep = ApproveStep | TransferStep | IntentStep;
