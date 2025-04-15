import { Hex } from "viem";
import { Chain, Token } from "./relayoor/types";

export type UserAsset = {
  asset: Token;
  amount: number;
  chain: Chain;
  decimals: number;
};

export type GroupedTokens = Record<
  string,
  { assetName: string; chain: string }[]
>;

export type CreateIntentParams = {
  creator: Hex;
  originChainID: Number;
  destinationChainID: Number;
  calls: IntentCall[];
  callTokens: IntentToken[];
  tokens: IntentToken[];
  prover: "HyperProver" | "StorageProver" | Hex;
  expiryTime?: Date;
};

type IntentCall = {
  target: Hex;
  data: Hex;
  value: bigint;
};

type IntentToken = {
  token: Hex;
  amount: bigint;
};
