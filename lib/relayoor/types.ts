export type RelayoorChain =
  | "ethereum"
  | "optimism"
  | "polygon"
  | "base"
  | "arbitrum";

export type RelayoorToken = "usdt" | "usdc" | "usdce" | "usdbc";

export interface RelayoorResponse {
  data: Record<RelayoorChain, TokenBalance[]>;
}

export interface TokenBalance {
  token: RelayoorToken;
  amount: string;
}

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
