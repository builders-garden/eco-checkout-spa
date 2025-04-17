import { TokenSymbols } from "./enums";
import { Chain, Token } from "./relayoor/types";
import { Hex } from "viem";

// EVM empty address
export const EMPTY_ADDRESS: Hex = "0x0000000000000000000000000000000000000000";

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
