import { relayoorSupportedChains } from "../constants";

export type Chain = (typeof relayoorSupportedChains)[number];

export interface RelayoorResponse {
  data: Record<Chain, TokenBalance[]>;
}

export interface TokenBalance {
  token: string;
  amount: string;
}
