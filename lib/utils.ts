import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  unichain,
  celo,
  ink,
  apeChain,
} from "viem/chains";
import { CheckoutPageStateType, UserAsset, PaginationState } from "./types";
import { AlchemyRpcBaseUrls, PaymentPageState } from "./enums";
import {
  RoutesSupportedChainId,
  stableAddresses,
} from "@eco-foundation/routes-sdk";
import { Chain, createPublicClient, http } from "viem";
import { env } from "./zod";
import { Intent } from "./relayoor/types";

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
 * @throws {Error} If the chain ID is not supported
 * @returns The chain object or string
 */
export const chainIdToChain = (chainId: number, asString: boolean = false) => {
  switch (chainId) {
    case 1:
      return asString ? "ethereum" : mainnet;
    case 10:
      return asString ? "optimism" : optimism;
    case 130:
      return asString ? "unichain" : unichain;
    case 137:
      return asString ? "polygon" : polygon;
    case 8453:
      return asString ? "base" : base;
    case 42161:
      return asString ? "arbitrum" : arbitrum;
    case 42220:
      return asString ? "celo" : celo;
    case 57073:
      return asString ? "ink" : ink;
    case 33139:
      return asString ? "apechain" : apeChain;
    default:
      throw new Error(`Unknown chain ID: ${chainId}`);
  }
};

/**
 * Converts a chain string to a chain ID
 * @param chain - The chain string
 * @throws {Error} If the chain is not supported
 * @returns The chain ID
 */
export const chainStringToChainId = (chain: string): RoutesSupportedChainId => {
  switch (chain) {
    case "ethereum":
      return 1;
    case "mainnet":
      return 1;
    case "optimism":
      return 10;
    case "unichain":
      return 130;
    case "uni": // This is the name that is used by the Relayoor
      return 130;
    case "polygon":
      return 137;
    case "base":
      return 8453;
    case "arbitrum":
      return 42161;
    case "celo":
      return 42220;
    case "ink":
      return 57073;
    case "apechain":
      return 33139;
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
    arr1.every((value, index) => deepCompareUserAssets(value, arr2[index]))
  );
};

/**
 * Gets the amount deducted from a token starting from the intents
 * @param token - The token to deduct the amount from
 * @param intents - The intents list to do all the calculations from
 * @param amountDueRaw - The amount the user has to pay
 * @returns The amount deducted from the token
 */
export const getAmountDeducted = (
  token: UserAsset,
  intents: Intent[],
  amountDueRaw: number
): number => {
  // Search among the intents for the token abd try to get the amount deducted
  for (const intent of intents) {
    const { tokens } = intent.rewardData;
    const amountDeducted = tokens.find(
      (t) => t.token.toLowerCase() === token.tokenContractAddress.toLowerCase()
    )?.amount;
    if (amountDeducted) {
      return Number(amountDeducted);
    }
  }

  // If the for loop ended without returning, the token is the one
  // on the destination chain, so we need to calculate the amount deducted
  const totalAmountReceivedFromDifferentChains = intents.reduce(
    (acc, intent) => {
      const { tokens } = intent.routeData;
      const amountReceived = tokens.reduce(
        (acc, token) => acc + Number(token.amount),
        0
      );
      return acc + amountReceived;
    },
    0
  );

  return amountDueRaw - totalAmountReceivedFromDifferentChains;
};

/**
 * Groups selected tokens by asset name and chain ordered by amount deducted, takes only one occurrence for each token+chain combination
 * @param selectedTokens - The selected tokens
 * @param amountDueRaw - The amount due
 * @param sendIntents - The intents list to do all the calculations from
 * @returns The grouped tokens
 */
export const groupSelectedTokensByAssetName = (
  selectedTokens: UserAsset[],
  amountDueRaw: number,
  sendIntents: Intent[]
) => {
  const orderedSelectedTokens = [...selectedTokens].sort(
    (a, b) =>
      getAmountDeducted(b, sendIntents, amountDueRaw) -
      getAmountDeducted(a, sendIntents, amountDueRaw)
  );
  return orderedSelectedTokens.reduce((acc, token) => {
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

/**
 * Gets the variants for the checkout page state animation
 * @param leftState - The previous state, relative to the component's perspective (e.g. for the recap container, the left state is the checkout one)
 * @param rightState - The next state, relative to the component's perspective (e.g. for the recap container, the right state is the transactions one)
 * @returns The variants
 */
export const getPaymentPageStateVariants = (
  leftState: PaymentPageState,
  rightState: PaymentPageState
) => {
  return {
    initial: (custom: CheckoutPageStateType) => ({
      opacity: 0,
      x:
        custom.previous === rightState
          ? -100
          : custom.previous === leftState
          ? 100
          : 0,
    }),
    animate: { opacity: 1, x: 0 },
    exit: (custom: CheckoutPageStateType) => ({
      opacity: 0,
      x:
        custom.current === leftState
          ? 100
          : custom.current === rightState
          ? -100
          : 0,
    }),
  };
};

/**
 * Gets the variants for the pagination animation
 * @param direction - The direction of the pagination
 * @returns The variants
 */
export const getPaginationVariants = () => {
  return {
    initial: (custom: PaginationState) => ({
      opacity: 0,
      x:
        custom.currentPage > custom.previousPage
          ? 30
          : custom.currentPage < custom.previousPage
          ? -30
          : 0,
    }),
    animate: { opacity: 1, x: 0 },
    exit: (custom: PaginationState) => ({
      opacity: 0,
      x:
        custom.currentPage < custom.previousPage
          ? 30
          : custom.currentPage > custom.previousPage
          ? -30
          : 0,
    }),
  };
};

/**
 * Converts a wei bigint to a gwei bigint
 * @param wei - The bigint in wei
 * @returns The number in gwei
 */
export const bigIntWeiToGwei = (wei: bigint): number => {
  return Number(wei) / 10 ** 9; // 1.000.000.000
};

/**
 * Checks if the current device is a mobile device
 * @returns True if the device is a mobile device, false otherwise
 */
export const isDeviceMobile = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
};

/**
 * Gets a viem public client for a given chain
 * @param chain - The chain
 * @returns The viem public client
 */
export const getViemPublicClient = (chain: Chain) => {
  return createPublicClient({
    chain,
    transport: http(
      `${
        AlchemyRpcBaseUrls[
          chain.name.toLowerCase() as keyof typeof AlchemyRpcBaseUrls
        ]
      }/${env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
    ),
  });
};

/**
 * Converts a number to a human readable amount
 * @param amount - The amount
 * @param decimals - The decimals
 * @returns The human readable amount in the form of a string made like X.xx
 */
export const getHumanReadableAmount = (
  amount: number,
  decimals: number
): string => {
  if (amount === 0) return "0.00";
  const humanReadableAmount = amount / 10 ** decimals;
  if (humanReadableAmount < 0.01) {
    return "<0.01";
  }
  return humanReadableAmount.toFixed(2);
};

/**
 * Deep compares two user assets
 * @param asset1 - The first user asset
 * @param asset2 - The second user asset
 * @returns True if the user assets are the same, false otherwise
 */
export const deepCompareUserAssets = (asset1: UserAsset, asset2: UserAsset) => {
  return (
    asset1.asset === asset2.asset &&
    asset1.chain === asset2.chain &&
    asset1.decimals === asset2.decimals &&
    asset1.tokenContractAddress === asset2.tokenContractAddress
  );
};

/**
 * Gets the token symbol from a token address
 * @param chainId - The chain ID
 * @param tokenAddress - The token address
 * @returns The token symbol
 */
export const getTokenSymbolFromAddress = (
  chainId: number,
  tokenAddress: string
) => {
  const allowedTokens = stableAddresses[chainId as RoutesSupportedChainId];

  const symbol = Object.entries(allowedTokens).find(
    ([_, address]) => address.toLowerCase() === tokenAddress.toLowerCase()
  )?.[0];

  return symbol;
};

/**
 * Gets the date from a Relayoor timestamp
 * @param timestamp - The timestamp
 * @returns The date in the format of DD/MM/YYYY
 */
export const getDateFromRelayoorTimestamp = (timestamp: string) => {
  const [year, month, day] = timestamp.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
};

/**
 * Gets the time from a Relayoor timestamp
 * @param timestamp - The timestamp
 * @returns The time in the format of HH:MM:SS
 */
export const getTimeFromRelayoorTimestamp = (timestamp: string) => {
  return timestamp.split("T")[1].split(".")[0].slice(0, 5);
};
