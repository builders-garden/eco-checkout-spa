import { AnimatePresence, motion } from "framer-motion";
import { CheckoutPageStateType } from "@/lib/types";
import { PaymentRecap } from "./payment-recap";
import { ConnectedWalletButton } from "../connected-wallet-button";
import { ChosenTokenList } from "./chosen-token-list";
import { CheckoutPageState } from "@/lib/enums";
import { getPageStateVariants } from "@/lib/utils";
import { CustomButton } from "../customButton";

interface RecapContainerProps {
  checkoutPageState: CheckoutPageStateType;
  setCheckoutPageState: (checkoutPageState: CheckoutPageState) => void;
}

export const RecapContainer = ({
  checkoutPageState,
  setCheckoutPageState,
}: RecapContainerProps) => {
  const variants = getPageStateVariants(
    CheckoutPageState.CHECKOUT,
    CheckoutPageState.TRANSACTIONS
  );

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={checkoutPageState}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-start size-full min-h-screen sm:min-h-0 sm:max-w-[496px] p-4.5 sm:p-5 gap-4 sm:border sm:border-secondary-foreground sm:rounded-[8px] overflow-hidden bg-background"
    >
      {/* Payment Summary/Recap */}
      <PaymentRecap setCheckoutPageState={setCheckoutPageState} />

      <AnimatePresence initial={false}>
        <ConnectedWalletButton key="connected-wallet-button" disabled={true} />
        <ChosenTokenList key="chosen-token-list" />
      </AnimatePresence>

      {/* Go to Transaction Button */}
      <CustomButton
        onClick={() => setCheckoutPageState(CheckoutPageState.TRANSACTIONS)}
        text="Confirm & Pay"
      />
    </motion.div>
  );
};
