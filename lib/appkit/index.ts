import { cookieStorage, createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  mainnet,
  optimism,
  unichain,
  polygon,
  base,
  arbitrum,
  celo,
  ink,
} from "@reown/appkit/networks";
import { env } from "../zod";

export const networks = [mainnet, optimism, polygon, base, arbitrum, celo, ink];

export const projectId = env.NEXT_PUBLIC_REOWN_APP_ID;

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
