import { CheckoutPageState } from "@/lib/enums";
import { AnimatePresence, motion } from "framer-motion";
import { PaymentSummary } from "./payment-summary";
import { CardState } from "@/lib/enums";
import { ConnectWalletInfo } from "./connect-wallet-info";
import { ConnectedWalletButton } from "../connected-wallet-button";
import { PaymentMethodCard } from "./payment-method-card/payment-method-card";
import { ActionsButton } from "./actions-button";
import { CheckoutPageStateType } from "@/lib/types";
import { getCheckoutPageStateVariants } from "@/lib/utils";

interface CheckoutContainerProps {
  checkoutPageState: CheckoutPageStateType;
  setCheckoutPageState: (checkoutPageState: CheckoutPageState) => void;
  animationState: CardState | null;
}

export const CheckoutContainer = ({
  checkoutPageState,
  setCheckoutPageState,
  animationState,
}: CheckoutContainerProps) => {
  const variants = getCheckoutPageStateVariants(
    CheckoutPageState.MISSING_PARAMS,
    CheckoutPageState.PAYMENT_RECAP
  );

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={checkoutPageState}
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
        <ActionsButton
          key="actions-button"
          setCheckoutPageState={setCheckoutPageState}
        />
      </AnimatePresence>
    </motion.div>
  );
};
