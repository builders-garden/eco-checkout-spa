"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { wagmiRainbowConfig } from "@/lib/wagmi";
import { WagmiProvider } from "wagmi";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

const client = new QueryClient();

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={wagmiRainbowConfig}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
