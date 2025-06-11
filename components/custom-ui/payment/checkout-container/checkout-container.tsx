import { PaymentPageState } from "@/lib/enums";
import { AnimatePresence, motion } from "framer-motion";
import { PaymentSummary } from "./payment-summary";
import { CardState } from "@/lib/enums";
import { ConnectWalletInfo } from "./connect-wallet-info";
import { ConnectedWalletButton } from "@/components/custom-ui/connected-wallet-button";
import { PaymentMethodCard } from "./payment-method-card/payment-method-card";
import { ActionsButton } from "./actions-button";
import { CheckoutPageStateType } from "@/lib/types";
import { getPaymentPageStateVariants } from "@/lib/utils";
import { usePermitModal } from "@/components/providers/permit-modal/permit-modal-provider";
import { useEffect } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useUserBalances } from "@/components/providers/user-balances-provider";

interface CheckoutContainerProps {
  paymentPageState: CheckoutPageStateType;
  setPaymentPageState: (paymentPageState: PaymentPageState) => void;
  animationState: CardState | null;
}

export const CheckoutContainer = ({
  paymentPageState,
  setPaymentPageState,
  animationState,
}: CheckoutContainerProps) => {
  const { isConnected } = useAppKitAccount();
  const { hasFetchedUserBalances, userBalances } = useUserBalances();
  const { openPermitModal } = usePermitModal();
  const variants = getPaymentPageStateVariants(
    PaymentPageState.MISSING_PARAMS,
    PaymentPageState.TRANSACTIONS
  );

  // Open Permit Modal as soon as the user is connected and his stables are fetched
  useEffect(() => {
    if (isConnected && hasFetchedUserBalances && userBalances.length > 0) {
      setTimeout(() => {
        openPermitModal();
      }, 1300);
    }
  }, [isConnected, hasFetchedUserBalances, userBalances]);

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={paymentPageState}
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
          setPaymentPageState={setPaymentPageState}
        />
      </AnimatePresence>
    </motion.div>
  );
};
