import { mainnet } from "viem/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { env } from "../zod";

export const wagmiRainbowConfig = getDefaultConfig({
  appName: "Eco Checkout SPA",
  projectId: env.NEXT_PUBLIC_REOWN_APP_ID,
  chains: [mainnet],
  ssr: true,
});
