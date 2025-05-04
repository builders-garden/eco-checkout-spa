import { mainnet, polygon, optimism, arbitrum, base } from "viem/chains";
import {
  ContractParams,
  PageStateType,
  TransactionStep,
  UserAsset,
} from "./types";
import { PageState } from "./enums";
import { RoutesSupportedChainId } from "@eco-foundation/routes-sdk";
import { erc20Abi } from "viem";
import { IntentSourceAbi } from "@eco-foundation/routes-ts";
import {
  INCREASE_L2_PROTOCOL_FEE,
  MIN_L2_PROTOCOL_FEE,
  INCREASE_MAINNET_PROTOCOL_FEE,
  MIN_MAINNET_PROTOCOL_FEE,
} from "./constants";

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
    case 137:
      return asString ? "polygon" : polygon;
    case 8453:
      return asString ? "base" : base;
    case 42161:
      return asString ? "arbitrum" : arbitrum;
    default:
      throw new Error(`Unknown chain ID: ${chainId}`);
  }
};

/**
 * Converts a chain ID to a chain name with the first letter capitalized
 * @param chainId - The chain ID
 * @throws {Error} If the chain ID is not supported
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
export const chainStringToChainId = (chain: string): RoutesSupportedChainId => {
  switch (chain) {
    case "ethereum":
      return 1;
    case "mainnet":
      return 1;
    case "optimism":
      return 10;
    case "polygon":
      return 137;
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
  // Safety check to avoid useless computations
  if (selectedTokens.length === 1) {
    if (token.amount > amountDue) {
      return amountDue;
    } else {
      return token.amount;
    }
  }

  let selectedArraySum = 0;
  for (let i = 0; i < selectedTokens.length; i++) {
    const currentToken = selectedTokens[i];

    // Calculate the current iteration remaining amount
    const currentRemainingAmount = amountDue - selectedArraySum;

    // Calculate the next iteration remaining amount
    const nextRemainingAmount =
      amountDue - (selectedArraySum + currentToken.amount);

    // If the next token is a risky one, we need to be sure that the remaining amount is enough to cover the fees
    if (
      nextRemainingAmount > 0 &&
      nextRemainingAmount < MIN_MAINNET_PROTOCOL_FEE &&
      i + 1 < selectedTokens.length &&
      selectedTokens[i + 1].isTokenAtRisk
    ) {
      const reducedAmount =
        currentToken.amount -
        Math.ceil((MIN_MAINNET_PROTOCOL_FEE - nextRemainingAmount) * 100) / 100;
      if (currentToken === token) {
        return reducedAmount;
      } else {
        selectedArraySum += reducedAmount;
      }
    } else if (currentToken === token) {
      return currentToken.amount > currentRemainingAmount
        ? currentRemainingAmount
        : currentToken.amount;
    } else {
      selectedArraySum += currentToken.amount;
    }
  }
  return 0;
};

/**
 * Groups selected tokens by asset name and chain ordered by amount deducted, takes only one occurrence for each token+chain combination
 * @param selectedTokens - The selected tokens
 * @param amountDue - The amount due
 * @returns The grouped tokens
 */
export const groupSelectedTokensByAssetName = (
  selectedTokens: UserAsset[],
  amountDue: number
) => {
  const orderedSelectedTokens = [...selectedTokens].sort(
    (a, b) =>
      getAmountDeducted(amountDue, selectedTokens, b) -
      getAmountDeducted(amountDue, selectedTokens, a)
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
 * Gets the variants for the page state animation
 * @param leftState - The previous state, relative to the component's perspective (e.g. for the recap container, the left state is the checkout one)
 * @param rightState - The next state, relative to the component's perspective (e.g. for the recap container, the right state is the transactions one)
 * @returns The variants
 */
export const getPageStateVariants = (
  leftState: PageState,
  rightState: PageState
) => {
  return {
    initial: (custom: PageStateType) => ({
      opacity: 0,
      x:
        custom.previous === rightState
          ? -100
          : custom.previous === leftState
          ? 100
          : 0,
    }),
    animate: { opacity: 1, x: 0 },
    exit: (custom: PageStateType) => ({
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
 * Converts a wei bigint to a gwei bigint
 * @param wei - The bigint in wei
 * @returns The number in gwei
 */
export const bigIntWeiToGwei = (wei: bigint): number => {
  return Number(wei) / 10 ** 9; // 1.000.000.000
};

/**
 * Extracts the parameters for a transaction step
 * @param step - The transaction step
 * @param chainId - The chain id
 * @returns The parameters for the transaction step
 */
export const extractStepParams = (
  step: TransactionStep,
  chainId: RoutesSupportedChainId
): ContractParams => {
  if (step.type === "approve") {
    return {
      abi: erc20Abi,
      functionName: "approve",
      address: step.assets[0].tokenContractAddress,
      args: [step.intentSourceContract, step.allowanceAmount],
      chainId,
    };
  } else if (step.type === "transfer") {
    return {
      abi: erc20Abi,
      functionName: "transfer",
      address: step.assets[0].tokenContractAddress,
      args: [step.to, BigInt(step.assets[0].amountToSend)],
      chainId,
    };
  } else {
    return {
      abi: IntentSourceAbi,
      address: step.intentSourceContract,
      functionName: "publishAndFund",
      args: [step.intent!, false],
      chainId,
    };
  }
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
 * Gets the fees, given the amount to send and the chain id
 * @param amountToSend - The amount to send
 * @param tokenChainId - The chain id where the amount will be sent
 * @param desiredNetworkId - The chain id of the desired network
 * @param tokenDecimals - The decimals of the token
 * @returns The fees
 */
export const getFees = (
  amountToSend: number,
  tokenChainId: RoutesSupportedChainId,
  desiredNetworkId: RoutesSupportedChainId,
  tokenDecimals: number
) => {
  if (
    tokenChainId !== desiredNetworkId &&
    (tokenChainId === 1 || desiredNetworkId === 1)
  ) {
    return (
      (Math.floor(amountToSend / 10 ** (tokenDecimals + 2)) *
        INCREASE_MAINNET_PROTOCOL_FEE +
        MIN_MAINNET_PROTOCOL_FEE) *
      10 ** tokenDecimals
    );
  } else {
    return (
      (Math.floor(amountToSend / 10 ** (tokenDecimals + 2)) *
        INCREASE_L2_PROTOCOL_FEE +
        MIN_L2_PROTOCOL_FEE) *
      10 ** tokenDecimals
    );
  }
};
