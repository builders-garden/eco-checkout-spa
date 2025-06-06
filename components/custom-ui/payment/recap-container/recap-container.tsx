import { AnimatePresence, motion } from "framer-motion";
import { CheckoutPageStateType } from "@/lib/types";
import { PaymentRecap } from "./payment-recap";
import { ConnectedWalletButton } from "@/components/custom-ui/connected-wallet-button";
import { ChosenTokenList } from "./chosen-token-list";
import { PaymentPageState } from "@/lib/enums";
import { getPaymentPageStateVariants } from "@/lib/utils";
import { CustomButton } from "@/components/custom-ui/customButton";

interface RecapContainerProps {
  paymentPageState: CheckoutPageStateType;
  setPaymentPageState: (paymentPageState: PaymentPageState) => void;
}

export const RecapContainer = ({
  paymentPageState,
  setPaymentPageState,
}: RecapContainerProps) => {
  const variants = getPaymentPageStateVariants(
    PaymentPageState.CHECKOUT,
    PaymentPageState.TRANSACTIONS
  );

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={paymentPageState}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-start size-full min-h-screen sm:min-h-0 sm:max-w-[496px] p-4.5 sm:p-5 gap-4 sm:border sm:border-secondary-foreground sm:rounded-[8px] overflow-hidden bg-background"
    >
      {/* Payment Summary/Recap */}
      <PaymentRecap setPaymentPageState={setPaymentPageState} />

      <AnimatePresence initial={false}>
        <ConnectedWalletButton key="connected-wallet-button" disabled={true} />
        <ChosenTokenList key="chosen-token-list" />
      </AnimatePresence>

      {/* Go to Transaction Button */}
      <CustomButton
        onClick={() => setPaymentPageState(PaymentPageState.TRANSACTIONS)}
        text="Confirm & Pay"
      />
    </motion.div>
  );
};
