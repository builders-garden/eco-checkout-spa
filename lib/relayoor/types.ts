import { Address } from "viem";

// Common Types
export type RelayoorChain =
  | "ethereum"
  | "optimism"
  | "polygon"
  | "base"
  | "arbitrum";

export type RelayoorToken = "usdt" | "usdc" | "usdce" | "usdbc";

export interface TokenBalance {
  token: RelayoorToken;
  amount: string;
}

// Balance Response Types
export interface BalanceResponse {
  data: Record<RelayoorChain, TokenBalance[]>;
}

// Get Transfers Response Types
export interface GetTransfersResponse {
  data: Record<string, Transfer[]>;
}

export interface Transfer {
  chainID: number;
  token: string;
  tokenSymbol: string;
  amount: string;
  hasPermit: boolean;
  permit3Allowance: string;
}

// Send Response Types
export interface SendResponse {
  data: {
    requestID: string;
    dAppID: string;
    intents: Intent[];
    permit3SignatureData: Permit3SignatureData;
  };
}

export interface RequestedTransferType {
  chainID: number;
  token: string;
  tokenSymbol: string;
  amount: string;
  hasPermit: boolean;
  permit3Allowance: string;
}

export interface Intent {
  routeData: RouteData;
  rewardData: RewardData;
}

export interface RouteData {
  originChainID: string;
  destinationChainID: string;
  inboxContract: string;
  salt: string;
  tokens: TokenBalance[];
  calls: CallData[];
}

export interface CallData {
  target: string;
  data: string;
  value: string;
}

export interface RewardData {
  creator: string;
  proverContract: string;
  deadline: string;
  nativeValue: string;
  tokens: TokenBalance[];
}

export interface Permit3SignatureData {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: Address;
  };
  message: {
    owner: string;
    salt: string;
    deadline: string;
    timestamp: number;
    unhingedRoot: string;
  };
}
