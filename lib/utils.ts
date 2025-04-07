import { TokenDecimals } from "./enums";
import { Chain, TokenBalance } from "./relayoor/types";

/**
 * Truncates an address to the given size keeping the 0x prefix
 * @param address - The address to truncate
 * @param size - The size of the truncated address
 * @returns The truncated address
 */
export const truncateAddress = (address: string, size: number = 4) => {
  return `${address.slice(0, size + 2)}...${address.slice(-size)}`;
};

/**
 * Formats a token amount by chain
 * @param token - The token balance item
 * @returns The formatted token amount as a number
 */
export const formatTokenAmountByChain = (token: TokenBalance) => {
  return (
    Number(token.amount) /
    10 ** TokenDecimals[token.token as keyof typeof TokenDecimals]
  );
};
