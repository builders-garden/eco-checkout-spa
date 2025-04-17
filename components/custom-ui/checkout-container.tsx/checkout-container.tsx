import { PageState } from "@/lib/enums";

import { AnimatePresence, motion } from "framer-motion";
import { PaymentSummary } from "./payment-summary";
import { CardState } from "@/lib/enums";
import { ConnectWalletInfo } from "./connect-wallet-info";
import { ConnectedWalletButton } from "../connected-wallet-button";
import { PaymentMethodCard } from "./payment-method-card/payment-method-card";
import { ActionsButton } from "../actions-button";
import { PageStateType } from "@/lib/types";

interface CheckoutContainerProps {
  pageState: PageStateType;
  setPageState: (pageState: PageState) => void;
  animationState: CardState | null;
}

export const CheckoutContainer = ({
  pageState,
  setPageState,
  animationState,
}: CheckoutContainerProps) => {
  const initialDirection =
    pageState.previous === PageState.MISSING_PARAMS
      ? 100
      : pageState.previous === PageState.PAYMENT_RECAP
      ? -100
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: initialDirection }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      custom={pageState.current}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-full sm:max-w-[496px] p-4 sm:p-5 gap-4 border border-secondary-foreground rounded-[8px] overflow-hidden"
    >
      {/* Payment Summary/Recap */}
      <PaymentSummary />

      {/* Single AnimatePresence to control both components */}
      <AnimatePresence mode="wait" initial={false}>
        {animationState === CardState.CONNECT_WALLET && (
          <ConnectWalletInfo key="connect-wallet-info" />
        )}
        {animationState === CardState.SELECT_PAYMENT_METHOD && (
          <>
            <ConnectedWalletButton key="connected-wallet-button" />
            <PaymentMethodCard key="payment-method-card" />
          </>
        )}
      </AnimatePresence>

      {/* Connect Button */}
      <AnimatePresence mode="wait" initial={false}>
        <ActionsButton
          key="actions-button"
          pageState={pageState}
          setPageState={setPageState}
        />
      </AnimatePresence>
    </motion.div>
  );
};
