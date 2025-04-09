import { Chain, Token } from "./relayoor/types";

// EVM empty address
export const emptyAddress = "0x0000000000000000000000000000000000000000";

// Chains supported by eco
export const validChains: Chain[] = [
  "ethereum",
  "optimism",
  "polygon",
  "mantle",
  "base",
  "arbitrum",
];

// Tokens supported by eco
export const validTokens: Token[] = ["usdc", "usdt", "usdce", "usdbc"];
