import { motion } from "framer-motion";
import { ActionsButton } from "../actions-button";
import { PageState } from "@/lib/enums";
import { PaymentRecap } from "./payment-recap";
import { ConnectedWalletButton } from "../connected-wallet-button";
import { UserAsset } from "@/lib/types";
import { ChosenTokenList } from "./chosen-token-list";
import { usePageState } from "@/components/providers/page-state-provider";

interface RecapContainerProps {
  recipient: string;
  desiredNetwork: string;
  amountDue: number;
  selectedTokens: UserAsset[];
  selectedTotal: number;
}

export const RecapContainer = ({
  recipient,
  desiredNetwork,
  amountDue,
  selectedTokens,
  selectedTotal,
}: RecapContainerProps) => {
  const { pageState } = usePageState();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-full sm:max-w-[496px] p-4 sm:p-5 gap-4 border border-secondary-foreground rounded-[8px] overflow-hidden"
    >
      {/* Payment Summary/Recap */}
      <PaymentRecap
        recipient={recipient}
        desiredNetworkId={desiredNetwork}
        amountDue={amountDue}
      />

      <ConnectedWalletButton
        shouldAnimate={pageState !== PageState.PAYMENT_RECAP}
        disabled={true}
      />
      <ChosenTokenList selectedTokens={selectedTokens} amountDue={amountDue} />

      {/* Connect Button */}
      <ActionsButton
        isLoading={false}
        selectedTotal={selectedTotal}
        amountDue={amountDue}
      />
    </motion.div>
  );
};
