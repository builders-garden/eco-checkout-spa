import { cookieStorage, createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { CustomRpcUrlMap } from "@reown/appkit-common";
import {
  mainnet,
  optimism,
  unichain,
  polygon,
  base,
  arbitrum,
  celo,
  ink,
  apeChain,
} from "@reown/appkit/networks";
import { env } from "../zod";
import { AlchemyRpcBaseUrls } from "../enums";

export const networks = [
  mainnet,
  optimism,
  polygon,
  base,
  unichain,
  arbitrum,
  celo,
  ink,
  apeChain,
];

export const projectId = env.NEXT_PUBLIC_REOWN_APP_ID;

const alchemyApiKey = env.NEXT_PUBLIC_ALCHEMY_API_KEY;

// A function to generate custom RPC URLs
const getCustomRpcUrls = () => {
  const urls: CustomRpcUrlMap = {};
  for (const chain of networks) {
    urls[`eip155:${chain.id}`] = [
      {
        url: `${
          AlchemyRpcBaseUrls[
            chain.name.toLowerCase() as keyof typeof AlchemyRpcBaseUrls
          ]
        }/${alchemyApiKey}`,
      },
    ];
  }
  return urls;
};

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
  customRpcUrls: alchemyApiKey ? getCustomRpcUrls() : undefined,
});

export const config = wagmiAdapter.wagmiConfig;
