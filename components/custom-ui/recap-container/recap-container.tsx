import { motion } from "framer-motion";
import { ActionsButton } from "../actions-button";
import { PageStates } from "@/lib/enums";
import { PaymentRecap } from "./payment-recap";
import { ConnectedWalletButton } from "../connected-wallet-button";
import { UserAsset } from "@/lib/types";
import { ChosenTokenList } from "./chosen-token-list";

interface RecapContainerProps {
  recipient: string;
  desiredNetwork: string;
  amountDue: number;
  setPageState: (state: PageStates) => void;
  selectedTokens: UserAsset[];
  selectedTotal: number;
  pageState: PageStates;
  desiredToken: string;
  redirect: string;
}

export const RecapContainer = ({
  recipient,
  desiredNetwork,
  amountDue,
  setPageState,
  selectedTokens,
  selectedTotal,
  pageState,
  desiredToken,
  redirect,
}: RecapContainerProps) => {
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
        setPageState={setPageState}
      />

      <ConnectedWalletButton
        shouldAnimate={pageState !== PageStates.PAYMENT_RECAP}
        disabled={true}
      />
      <ChosenTokenList selectedTokens={selectedTokens} amountDue={amountDue} />

      {/* Connect Button */}
      <ActionsButton
        isLoading={false}
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
