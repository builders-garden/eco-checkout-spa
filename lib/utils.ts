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

/**
 * Groups selected tokens by asset name and chain, takes only one occurrence for each token+chain combination
 * @param selectedTokens - The selected tokens
 * @returns The grouped tokens
 */
export const groupSelectedTokensByAssetName = (selectedTokens: UserAsset[]) => {
  return selectedTokens.reduce((acc, token) => {
    const assetName =
      token.asset === "usdce" || token.asset === "usdbc" ? "usdc" : token.asset;
    const chain = token.chain;
    // Check if same token and chain combination already exists
    const existingToken = acc[assetName]?.find(
      (t) => t.assetName === assetName && t.chain === chain
    );
    // If the combination doesn't exist, add the token to the array
    if (!existingToken) {
      acc[assetName] = acc[assetName] || [];
      acc[assetName].push({ assetName, chain });
    }
    return acc;
  }, {} as Record<string, { assetName: string; chain: string }[]>);
};
