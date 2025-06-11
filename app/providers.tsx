"use client";

import AppKitProvider from "@/components/providers/appkit-provider";
import { IsMobileProvider } from "@/components/providers/is-mobile-provider";
import { NamesProvider } from "@/components/providers/names-provider";
import { PaymentParamsProvider } from "@/components/providers/payment-params-provider";
import { PermitModalProvider } from "@/components/providers/permit-modal/permit-modal-provider";
import { SelectedTokensProvider } from "@/components/providers/selected-tokens-provider";
import { TransactionStepsProvider } from "@/components/providers/transaction-steps-provider";
import { UserBalancesProvider } from "@/components/providers/user-balances-provider";
import { TooltipProvider } from "@/components/shadcn-ui/tooltip";
import { NuqsAdapter } from "nuqs/adapters/next/app";

interface ProvidersProps {
  children: React.ReactNode;
  cookies: string | null;
}

// NOTE: The AppKit Provider also provides the Tanstack Query Client
export const Providers = ({ children, cookies }: ProvidersProps) => {
  return (
    <IsMobileProvider>
      <AppKitProvider cookies={cookies}>
        <NuqsAdapter>
          <PaymentParamsProvider>
            <NamesProvider>
              <UserBalancesProvider>
                <SelectedTokensProvider>
                  <TransactionStepsProvider>
                    <TooltipProvider>
                      <PermitModalProvider>{children}</PermitModalProvider>
                    </TooltipProvider>
                  </TransactionStepsProvider>
                </SelectedTokensProvider>
              </UserBalancesProvider>
            </NamesProvider>
          </PaymentParamsProvider>
        </NuqsAdapter>
      </AppKitProvider>
    </IsMobileProvider>
  );
};
