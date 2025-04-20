export type Chain = "ethereum" | "optimism" | "polygon" | "base" | "arbitrum";

export type Token = "usdt" | "usdc" | "usdce" | "usdbc";

export interface RelayoorResponse {
  data: Record<Chain, TokenBalance[]>;
}

export interface TokenBalance {
  token: Token;
  amount: string;
}
