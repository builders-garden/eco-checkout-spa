import { Abi, Hex } from "viem";
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
  chain: RelayoorChain;
  tokenContractAddress: Hex;
  decimals: number;
  isTokenAtRisk: boolean;
};

export type TransactionAsset = {
  asset: RelayoorToken;
  amountToSend: number;
  chain: RelayoorChain;
  tokenContractAddress: Hex;
  decimals: number;
};

export type GroupedTokens = Record<
  string,
  { assetName: string; chain: string }[]
>;

export type PageStateType = {
  current: PageState | null;
  previous: PageState | null;
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

export type ApproveStep = {
  type: "approve";
  status: TransactionStatus;
  originTransaction: { hash: Hex; link: string } | null;
  assets: TransactionAsset[];
  allowanceAmount: bigint;
  intentSourceContract: Hex;
};

export type TransferStep = {
  type: "transfer";
  status: TransactionStatus;
  originTransaction: { hash: Hex; link: string } | null;
  assets: TransactionAsset[];
  to: Hex;
};

export type IntentStep = {
  type: "intent";
  status: TransactionStatus;
  originTransaction: { hash: Hex; link: string } | null;
  destinationTransaction: { hash: Hex; link: string } | null;
  assets: TransactionAsset[];
  intent: IntentType | null;
  intentSourceContract: Hex;
};

export type TransactionStep = ApproveStep | TransferStep | IntentStep;

export type ContractParams = {
  abi: Abi;
  functionName: string;
  address: `0x${string}`;
  args: readonly unknown[];
  chainId: number;
};
