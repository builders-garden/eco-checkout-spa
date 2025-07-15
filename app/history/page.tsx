"use client";

import { AnimatePresence, motion } from "framer-motion";
import { InfoFooter } from "@/components/custom-ui/info-footer";
import { AllTransactionsList } from "@/components/custom-ui/history/all-transactions-list";
import { useQueryState } from "nuqs";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { IntentData } from "@/lib/relayoor/types";
import { useEffect, useMemo, useState } from "react";
import { ConnectWalletInfo } from "@/components/custom-ui/payment/checkout-container/connect-wallet-info";
import { CustomButton } from "@/components/custom-ui/customButton";
import { Loader } from "@/components/custom-ui/loader";
import { AllIntentsList } from "@/components/custom-ui/history/all-intents-list";
import { PaginationState } from "@/lib/types";

export default function Home() {
  const [isConnecting, setIsConnecting] = useState(true);

  // Pagination State (must be declared in the parent to avoid
  // resetting the page when the user goes back)
  const [paginationState, setPaginationState] = useState<PaginationState>({
    currentPage: 1,
    previousPage: 1,
  });

  // Get the creator from the context and open the AppKit wallet
  const { address } = useAppKitAccount();
  const { open } = useAppKit();

  // Get the intentGroupID from the query params
  const [intentGroupID, setIntentGroupID] = useQueryState("intentGroupID");

  // Get the whole history for the connected user from the Relayoor API
  const {
    data: history,
    isLoading: isLoadingHistory,
    error: errorHistory,
  } = useQuery({
    queryKey: ["history", intentGroupID],
    queryFn: () => {
      return ky
        .get<Record<string, IntentData[]>>(
          `/api/intents/get-intents/${address}`
        )
        .json();
    },
    enabled: !!address,
  });

  // Get the payment if the intentGroupID is set
  const selectedPayment = useMemo(() => {
    return intentGroupID ? history?.[intentGroupID] : undefined;
  }, [history, intentGroupID]);

  // Get the length of the history
  const historyLength = useMemo(() => {
    if (!history) return 0;
    return Object.keys(history).length;
  }, [history]);

  // Wait 1.5 seconds on component mount before setting isConnecting to false
  useEffect(() => {
    setTimeout(() => {
      setIsConnecting(false);
    }, 1500);
  }, []);

  return (
    <main className="flex relative flex-col items-center justify-start sm:justify-center min-h-screen h-auto sm:pt-6 sm:pb-14 overflow-y-auto [background-image:radial-gradient(#00000009_1px,transparent_1px)] [background-size:16px_16px]">
      <AnimatePresence mode="wait">
        {!address && !isConnecting ? (
          <motion.div
            key="connect-wallet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center gap-4"
          >
            <ConnectWalletInfo />
            <CustomButton
              onClick={() => {
                open();
              }}
              text="Connect Wallet"
            />
          </motion.div>
        ) : errorHistory ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-xl text-destructive justify-center gap-4"
          >
            <p>
              Error while fetching history: <br />
              <b>{errorHistory?.message}</b>
            </p>
          </motion.div>
        ) : isLoadingHistory || isConnecting ? (
          <Loader key="loader" />
        ) : history && intentGroupID && selectedPayment ? (
          <AllIntentsList
            key="all-intents-list"
            setIntentGroupID={setIntentGroupID}
            selectedPayment={selectedPayment}
          />
        ) : !history || historyLength === 0 ? (
          <motion.div
            key="no-transactions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center gap-4"
          >
            <p className="text-secondary text-lg">
              No transactions found for this address
            </p>
          </motion.div>
        ) : (
          <AllTransactionsList
            key="all-transactions-list"
            history={history}
            historyLength={historyLength}
            paginationState={paginationState}
            setPaginationState={setPaginationState}
          />
        )}
      </AnimatePresence>
      <InfoFooter />
    </main>
  );
}
