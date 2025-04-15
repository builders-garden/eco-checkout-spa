import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useMemo, useState } from "react";
import { UserAsset } from "@/lib/types";
import { PageStates } from "@/lib/enums";

interface ActionsButtonProps {
  isLoading: boolean;
  selectedTokens: UserAsset[];
  destinationToken: string;
  destinationChain: number;
  redirect: string;
  selectedTotal: number;
  amountDue: number;
  handleSetPageState: (state: PageStates) => void;
}

export const ActionsButton = ({
  isLoading,
  selectedTokens,
  destinationToken,
  destinationChain,
  redirect,
  selectedTotal,
  amountDue,
  handleSetPageState,
}: ActionsButtonProps) => {
  const [mounted, setMounted] = useState(false);
  const { isConnected, status, address } = useAppKitAccount();
  const { open } = useAppKit();

  useEffect(() => {
    setMounted(true);
  }, []);

  // States
  const ready = status !== "connecting" && status !== "reconnecting";
  const connected = isConnected && !!address;
  const showLoader = !mounted || isLoading || !ready;
  const isDisabled = connected && selectedTotal < amountDue;

  // Button Props
  const { text, onClick, key } = useMemo(() => {
    if (!connected) {
      return {
        text: "Connect Wallet",
        onClick: () => open({ view: "Connect" }),
        key: "connect",
      };
    }
    return {
      text: "Confirm",
      onClick: () => {
        handleSetPageState(PageStates.PAYMENT_RECAP);
      },
      key: "confirm",
    };
  }, [connected, open]);

  // TODO: The array containing all the steps
  // const steps: CreateIntentParams[] = useMemo(() => {
  //   return selectedTokens.map((token) => {
  //     return {
  //       creator: address as Hex,
  //       originChainID: chainStringToChainId(token.chain),
  //       destinationChainID: destinationChain,
  //       calls: [],
  //       callTokens: [],
  //       tokens: [],
  //       prover: "StorageProver",
  //     };
  //   });
  // }, [selectedTokens]);

  // const routesService = new RoutesService();

  // // Bridge: Create a simple stable transfer between two chains
  // const intent = routesService.createSimpleIntent({
  //   creator: address,
  //   originChainID,
  //   spendingToken,
  //   spendingTokenBalance,
  //   destinationChainID,
  //   receivingToken,
  //   amount,
  //   recipient: address, // optional, defaults to the creator if not passed
  // });

  // const openQuotingClient = new OpenQuotingClient({ dAppID: 'my-dapp' });
  // const quotes = await openQuotingClient.requestQuotesForIntent(intent);

  return (
    <motion.button
      initial={{ opacity: 1 }}
      animate={{ opacity: showLoader || isDisabled ? 0.7 : 1 }}
      whileHover={{ scale: showLoader || isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: showLoader || isDisabled ? 1 : 0.98 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="flex justify-center items-center w-full bg-primary rounded-[8px] p-4 h-[60px] cursor-pointer"
      type="button"
      disabled={showLoader || isDisabled}
      style={{
        zIndex: 50,
      }}
    >
      <AnimatePresence mode="wait">
        <p key={key} className="text-xl text-white font-bold">
          {showLoader ? <Loader2 className="size-6 animate-spin" /> : text}
        </p>
      </AnimatePresence>
    </motion.button>
  );
};
