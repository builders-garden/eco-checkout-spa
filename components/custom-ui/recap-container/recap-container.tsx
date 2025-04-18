import { AnimatePresence, motion } from "framer-motion";
import { ActionsButton } from "../actions-button";
import { PageStateType } from "@/lib/types";
import { PaymentRecap } from "./payment-recap";
import { ConnectedWalletButton } from "../connected-wallet-button";
import { ChosenTokenList } from "./chosen-token-list";
import { PageState } from "@/lib/enums";

interface RecapContainerProps {
  pageState: PageStateType;
  setPageState: (pageState: PageState) => void;
}

export const RecapContainer = ({
  pageState,
  setPageState,
}: RecapContainerProps) => {
  const variants = {
    initial: (custom: PageStateType) => ({
      opacity: 0,
      x:
        custom.previous === PageState.TRANSACTIONS
          ? -100
          : custom.previous === PageState.CHECKOUT
          ? 100
          : 0,
    }),
    animate: { opacity: 1, x: 0 },
    exit: (custom: PageStateType) => ({
      opacity: 0,
      x:
        custom.current === PageState.CHECKOUT
          ? 100
          : custom.current === PageState.TRANSACTIONS
          ? -100
          : 0,
    }),
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={pageState}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-full sm:max-w-[496px] p-4 sm:p-5 gap-4 border border-secondary-foreground rounded-[8px] overflow-hidden"
    >
      {/* Payment Summary/Recap */}
      <PaymentRecap setPageState={setPageState} />

      <AnimatePresence initial={false}>
        <ConnectedWalletButton key="connected-wallet-button" disabled={true} />
        <ChosenTokenList key="chosen-token-list" />
      </AnimatePresence>

      {/* Connect Button */}
      <AnimatePresence mode="wait">
        <ActionsButton
          key="actions-button"
          pageState={pageState}
          setPageState={setPageState}
        />
      </AnimatePresence>
    </motion.div>
  );
};
