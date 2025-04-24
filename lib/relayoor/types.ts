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
