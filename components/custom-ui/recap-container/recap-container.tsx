import { AnimatePresence, motion } from "framer-motion";
import { PageStateType } from "@/lib/types";
import { PaymentRecap } from "./payment-recap";
import { ConnectedWalletButton } from "../connected-wallet-button";
import { ChosenTokenList } from "./chosen-token-list";
import { PageState } from "@/lib/enums";
import { getPageStateVariants } from "@/lib/utils";
import { CustomButton } from "../customButton";

interface RecapContainerProps {
  pageState: PageStateType;
  setPageState: (pageState: PageState) => void;
}

export const RecapContainer = ({
  pageState,
  setPageState,
}: RecapContainerProps) => {
  const variants = getPageStateVariants(
    PageState.CHECKOUT,
    PageState.TRANSACTIONS
  );

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

      {/* Go to Transaction Button */}
      <CustomButton
        onClick={() => setPageState(PageState.TRANSACTIONS)}
        text="Confirm & Send"
      />
    </motion.div>
  );
};
