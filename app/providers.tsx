"use client";

import AppKitProvider from "@/components/providers/appkit-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

interface ProvidersProps {
  children: React.ReactNode;
  cookies: string | null;
}

// NOTE: The AppKit Provider also provides the Tanstack Query Client
export const Providers = ({ children, cookies }: ProvidersProps) => {
  return (
    <AppKitProvider cookies={cookies}>
      <NuqsAdapter>{children}</NuqsAdapter>
    </AppKitProvider>
  );
};
