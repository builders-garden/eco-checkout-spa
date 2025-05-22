import { PageState } from "@/lib/enums";

import { AnimatePresence, motion } from "framer-motion";
import { PaymentSummary } from "./payment-summary";
import { CardState } from "@/lib/enums";
import { ConnectWalletInfo } from "./connect-wallet-info";
import { ConnectedWalletButton } from "../connected-wallet-button";
import { PaymentMethodCard } from "./payment-method-card/payment-method-card";
import { ActionsButton } from "./actions-button";
import { PageStateType } from "@/lib/types";
import { getPageStateVariants } from "@/lib/utils";

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
  const variants = getPageStateVariants(
    PageState.MISSING_PARAMS,
    PageState.PAYMENT_RECAP
  );

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={pageState}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-start size-full min-h-screen sm:min-h-0 sm:max-w-[496px] p-4.5 sm:p-5 gap-4 sm:border sm:border-secondary-foreground sm:rounded-[8px] overflow-hidden  bg-background"
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
        <ActionsButton key="actions-button" setPageState={setPageState} />
      </AnimatePresence>
    </motion.div>
  );
};
