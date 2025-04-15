import { PageStates } from "@/lib/enums";

import { AnimatePresence, motion } from "framer-motion";
import { PaymentSummary } from "./payment-summary";
import { CardStates } from "@/lib/enums";
import { ConnectWalletInfo } from "./connect-wallet-info";
import { ConnectedWalletButton } from "../connected-wallet-button";
import { PaymentMethodCard } from "./payment-method-card/payment-method-card";
import { ActionsButton } from "../actions-button";
import { UserAsset } from "@/lib/types";

interface CheckoutContainerProps {
  recipient: string;
  desiredNetwork: string;
  amountDue: number;
  selectedTokens: UserAsset[];
  setSelectedTokens: (
    tokens: UserAsset[] | ((prev: UserAsset[]) => UserAsset[])
  ) => void;
  userBalances: UserAsset[];
  optimizedSelection: UserAsset[];
  isLoadingUserBalances: boolean;
  pageState: PageStates | null;
  setPageState: (pageState: PageStates) => void;
  desiredToken: string;
  redirect: string;
  selectedTotal: number;
  animationState: CardStates | null;
}

export const CheckoutContainer = ({
  recipient,
  desiredNetwork,
  amountDue,
  selectedTokens,
  setSelectedTokens,
  userBalances,
  optimizedSelection,
  isLoadingUserBalances,
  pageState,
  setPageState,
  desiredToken,
  redirect,
  selectedTotal,
  animationState,
}: CheckoutContainerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-full sm:max-w-[496px] p-4 sm:p-5 gap-4 border border-secondary-foreground rounded-[8px] overflow-hidden"
    >
      {/* Payment Summary/Recap */}
      <PaymentSummary
        recipient={recipient}
        desiredNetworkId={desiredNetwork}
        amountDue={amountDue}
      />

      {/* Single AnimatePresence to control both components */}
      <AnimatePresence mode="wait">
        {animationState === CardStates.CONNECT_WALLET && (
          <ConnectWalletInfo key="connect-wallet-info" />
        )}
        {animationState === CardStates.SELECT_PAYMENT_METHOD && (
          <>
            <ConnectedWalletButton
              key="connected-wallet-button"
              shouldAnimate={pageState === PageStates.CHECKOUT}
            />
            <PaymentMethodCard
              key="payment-method-card"
              amountDue={amountDue}
              selectedTokens={selectedTokens}
              setSelectedTokens={setSelectedTokens}
              userAssets={userBalances}
              optimizedSelection={optimizedSelection}
              shouldAnimate={pageState === PageStates.CHECKOUT}
            />
          </>
        )}
      </AnimatePresence>

      {/* Connect Button */}
      <ActionsButton
        isLoading={isLoadingUserBalances}
        selectedTokens={selectedTokens}
        destinationToken={desiredToken}
        destinationChain={Number(desiredNetwork)}
        redirect={redirect}
        selectedTotal={selectedTotal}
        amountDue={amountDue}
        handleSetPageState={setPageState}
      />
    </motion.div>
  );
};
