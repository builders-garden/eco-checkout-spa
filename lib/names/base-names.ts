import {
  Address,
  createPublicClient,
  encodePacked,
  http,
  keccak256,
  namehash,
} from "viem";
import { base, mainnet } from "viem/chains";
import { AlchemyRpcBaseUrls } from "../enums";
import { env } from "../zod";
import { BASENAME_L2_RESOLVER_ADDRESS } from "../constants";
import BaseNamesResolverAbi from "../abi/BaseNamesResolverAbi";

/**
 * Convert a chainId to a coinType hex for reverse chain resolution
 * @param chainId - The chainId to convert
 * @returns The coinType hex
 */
export const convertChainIdToCoinType = (chainId: number): string => {
  // L1 resolvers to addr
  if (chainId === mainnet.id) {
    return "addr";
  }

  const cointype = (0x80000000 | chainId) >>> 0;
  return cointype.toString(16).toLocaleUpperCase();
};

/**
 * Convert an address to a reverse node for ENS resolution
 * @param address - The address to convert
 * @param chainId - The chainId of the address
 * @returns The reverse node for the address
 */
const convertReverseNodeToBytes = (address: Address, chainId: number) => {
  const addressFormatted = address.toLocaleLowerCase() as Address;
  const addressNode = keccak256(addressFormatted.substring(2) as Address);
  const chainCoinType = convertChainIdToCoinType(chainId);
  const baseReverseNode = namehash(
    `${chainCoinType.toLocaleUpperCase()}.reverse`
  );
  const addressReverseNode = keccak256(
    encodePacked(["bytes32", "bytes32"], [baseReverseNode, addressNode])
  );
  return addressReverseNode;
};

// Base Viem Public Client
export const viemBasePublicClient = createPublicClient({
  chain: base,
  transport: http(
    `${
      AlchemyRpcBaseUrls[
        base.name.toLowerCase() as keyof typeof AlchemyRpcBaseUrls
      ]
    }/${env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
  ),
});

/**
 * Get the Base name for an address
 * @param address - The address to get the Base name for
 * @returns The Base name for the address
 */
export const getBaseName = async (address: Address) => {
  try {
    const addressReverseNode = convertReverseNodeToBytes(
      address as Address,
      base.id
    );
    const basename = await viemBasePublicClient.readContract({
      abi: BaseNamesResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: "name",
      args: [addressReverseNode],
    });

    return (basename as string) ?? "";
  } catch (error) {
    // Handle the error accordingly
    console.log("Error getting Base Name from address", error);
    return "";
  }
};
