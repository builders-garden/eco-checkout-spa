import {
  mainnet,
  mantle,
  polygon,
  optimism,
  arbitrum,
  base,
} from "viem/chains";
import { UserAsset } from "./types";

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
 * Converts a chain ID to a chain Viem object or string, defaulting to base
 * @param chainId - The chain ID
 * @param asString - Whether to return the chain as a string (default: false)
 * @returns The chain object or string
 */
export const chainIdToChain = (chainId: number, asString: boolean = false) => {
  switch (chainId) {
    case 1:
      return asString ? "ethereum" : mainnet;
    case 10:
      return asString ? "optimism" : optimism;
    case 137:
      return asString ? "polygon" : polygon;
    case 5000:
      return asString ? "mantle" : mantle;
    case 42161:
      return asString ? "arbitrum" : arbitrum;
    default:
      return asString ? "base" : base;
  }
};

/**
 * Converts a chain ID to a chain name with the first letter capitalized
 * @param chainId - The chain ID
 * @returns The chain name
 */
export const chainIdToChainName = (chainId: number): string => {
  const chainName = chainIdToChain(chainId, true) as string;
  return chainName.charAt(0).toUpperCase() + chainName.slice(1);
};

/**
 * Converts a chain string to a chain ID
 * @param chain - The chain string
 * @throws {Error} If the chain is not supported
 * @returns The chain ID
 */
export const chainStringToChainId = (chain: string) => {
  switch (chain) {
    case "ethereum":
      return 1;
    case "mainnet":
      return 1;
    case "optimism":
      return 10;
    case "polygon":
      return 137;
    case "mantle":
      return 5000;
    case "base":
      return 8453;
    case "arbitrum":
      return 42161;
    default:
      throw new Error(`Unknown chain: ${chain}`);
  }
};

/**
 * Gets the contract address for a token on a given chain
 * @param token - The token name
 * @param chain - The chain name
 * @returns The contract address
 */
export const getTokenContractAddress = (token: string, chain: string) => {
  // Mainnet
  if (chain === "mainnet" || chain === "ethereum") {
    if (token === "usdc") {
      return "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    }
    if (token === "usdt") {
      return "0xdac17f958d2ee523a2206206994597c13d831ec7";
    }
  }

  // Optimism
  if (chain === "optimism") {
    if (token === "usdc") {
      return "0x0b2c639c533813f4aa9d7837caf62653d097ff85";
    }
    if (token === "usdce") {
      return "0x7F5c764cBc14f9669B88837ca1490cCa17c31607";
    }
    if (token === "usdt") {
      return "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58";
    }
  }

  // Polygon
  if (chain === "polygon") {
    if (token === "usdc") {
      return "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
    }
    if (token === "usdce") {
      return "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
    }
    if (token === "usdt") {
      return "0xc2132d05d31c914a87c6611c10748aeb04b58e8f";
    }
  }

  // Mantle
  if (chain === "mantle") {
    if (token === "usdc") {
      return "0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9";
    }
    if (token === "usdt") {
      return "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE";
    }
  }

  // Base
  if (chain === "base") {
    if (token === "usdc") {
      return "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
    }
    if (token === "usdbc") {
      return "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA";
    }
  }

  // Arbitrum
  if (chain === "arbitrum") {
    if (token === "usdc") {
      return "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
    }
    if (token === "usdce") {
      return "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8";
    }
    if (token === "usdt") {
      return "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9";
    }
  }
};

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns The capitalized string
 */
export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Compares two arrays to check if every element is present in the other array
 * @param arr1 - The first array
 * @param arr2 - The second array
 * @returns True if the arrays share the same elements, false otherwise
 */
export const compareArrays = (arr1: any[], arr2: any[]) => {
  return (
    arr1.length === arr2.length &&
    arr1.every((value) => arr2.includes(value)) &&
    arr2.every((value) => arr1.includes(value))
  );
};

/**
 * Gets the amount deducted from a specific token
 * @param amountDue - The amount due
 * @param selectedTokens - The selected tokens
 * @param token - The token to get the amount deducted from
 * @returns The amount deducted
 */
export const getAmountDeducted = (
  amountDue: number,
  selectedTokens: UserAsset[],
  token: UserAsset
) => {
  const orderedSelectedTokens = [...selectedTokens].sort(
    (a, b) => a.amount - b.amount
  );
  let total = amountDue;
  for (const t of orderedSelectedTokens) {
    if (t === token) {
      if (t.amount > total) {
        return total;
      }
      return t.amount;
    }
    total -= t.amount;
  }
  return total;
};
