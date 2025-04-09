import { Chain, Token } from "./relayoor/types";

export type UserAsset = {
  asset: Token;
  amount: number;
  chain: Chain;
  decimals: number;
};
