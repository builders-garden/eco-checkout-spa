import { createPublicClient, Address, http } from "viem";
import { mainnet } from "viem/chains";
import { AlchemyRpcBaseUrls } from "../enums";
import { env } from "../zod";
import { addEnsContracts } from "@ensdomains/ensjs";
import { getResolver } from "@ensdomains/ensjs/public";
import { normalize } from "viem/ens";
import {
  ENS_PUBLIC_RESOLVER_ADDRESS,
  ENS_PUBLIC_RESOLVER_ADDRESS_2,
} from "../constants";

// Mainnet Viem Public Client
export const viemMainnetPublicClient = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(
    `${
      AlchemyRpcBaseUrls[
        mainnet.name.toLowerCase() as keyof typeof AlchemyRpcBaseUrls
      ]
    }/${env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
  ),
});

/**
 * Get the ENS name for an address
 * @param address - The address to get the ENS name for
 * @returns The ENS name for the address
 */
export const getEnsName = async (address: Address): Promise<string> => {
  const resolver = await getResolver(viemMainnetPublicClient, {
    name: normalize(address as Address),
  });

  try {
    const foundEns = await viemMainnetPublicClient.getEnsName({
      address: address as Address,
      universalResolverAddress:
        resolver === ENS_PUBLIC_RESOLVER_ADDRESS_2 ||
        resolver === ENS_PUBLIC_RESOLVER_ADDRESS
          ? ("" as `0x${string}`)
          : (resolver as `0x${string}`),
    });

    return foundEns ? (foundEns as string) : "";
  } catch (error) {
    console.log("Error in getting ENS from address", error);
    return "";
  }
};

/**
 * Get the ENS name for an address
 * @param domain - The domain to get the ENS name for
 * @returns The ENS name for the domain
 */
export const getAddressFromEns = async (
  domain: string
): Promise<Address | null> => {
  // check if the domain parameter is an ens domain or a 0x adress (at least 20 characters long)
  const isEnsDomain = domain.endsWith(".eth")
    ? true
    : domain.length > 20 && domain.startsWith("0x")
    ? false
    : true;

  if (isEnsDomain) {
    try {
      let domainToCheck = domain.replace(".eth", "");

      // if the domain is less than 3 characters long, we return null
      if (domainToCheck.length < 3) {
        return null;
      }

      // Add back the .eth if it is not present
      domainToCheck = domainToCheck + ".eth";

      const resolver = await getResolver(viemMainnetPublicClient, {
        name: normalize(domainToCheck),
      });

      const ensAddressResult = await viemMainnetPublicClient.getEnsAddress({
        name: normalize(domainToCheck),
        universalResolverAddress:
          resolver === ENS_PUBLIC_RESOLVER_ADDRESS_2 ||
          resolver === ENS_PUBLIC_RESOLVER_ADDRESS
            ? ("" as `0x${string}`)
            : (resolver as `0x${string}`),
      });

      // Return null if the domain has not records set
      if (!ensAddressResult) {
        return null;
      } else {
        return ensAddressResult!;
      }
    } catch (error) {
      return null;
    }
  } else {
    return null;
  }
};
