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
import { Loader } from "@/components/custom-ui/loader";
import { AllIntentsList } from "@/components/custom-ui/history/all-intents-list";
import { PaginationState } from "@/lib/types";
import { Wallet } from "lucide-react";

export default function Home() {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isFetchingIntent, setIsFetchingIntent] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<
    IntentData[] | undefined
  >();

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
    queryKey: ["history"],
    queryFn: () => {
      return ky
        .get<Record<string, IntentData[]>>(
          `/api/intents/get-user-intents/${address}`
        )
        .json();
    },
    enabled: !!address,
  });

  // Get the payment if the intentGroupID is set from the history or from
  // an API call toward the backend
  useEffect(() => {
    const fetchSpecificIntent = async () => {
      if (!intentGroupID || isLoadingHistory || isConnecting) {
        setSelectedPayment(undefined);
        return;
      }

      if (history && Object.keys(history).length > 0) {
        const selectedFromHistory = intentGroupID
          ? history?.[intentGroupID]
          : undefined;

        if (selectedFromHistory) {
          setSelectedPayment(selectedFromHistory);
          return;
        }
      }

      // If the intentGroupID is not in the history, fetch it from the backend
      setIsFetchingIntent(true);
      try {
        const response = await ky
          .get<Record<string, IntentData[]>>(
            `/api/intents/get-external-intent/${intentGroupID}`
          )
          .json();

        setSelectedPayment(response?.[intentGroupID]);
      } catch (error) {
        setSelectedPayment(undefined);
      } finally {
        setIsFetchingIntent(false);
      }
    };

    fetchSpecificIntent();
  }, [isConnecting, isLoadingHistory, intentGroupID]);

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
        {isLoadingHistory || isConnecting || isFetchingIntent ? (
          <Loader key="loader" />
        ) : selectedPayment ? (
          <AllIntentsList
            key="all-intents-list"
            setIntentGroupID={setIntentGroupID}
            selectedPayment={selectedPayment}
          />
        ) : !address && !isConnecting ? (
          <motion.div
            key="connect-wallet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center gap-4 sm:min-h-auto min-h-screen"
          >
            <div className="flex flex-col justify-center w-full items-center text-center gap-3.5 mt-7 sm:-mt-1">
              <div className="flex p-3.5 justify-center items-center bg-secondary-foreground rounded-full">
                <Wallet className="size-[27px]" />
              </div>
              <div className="flex flex-col justify-center items-center gap-1">
                <h1 className="text-[18px] font-semibold">
                  Connect your wallet
                </h1>
                <p className="text-secondary text-[14px]">
                  Connect your wallet to see your payment history
                </p>
              </div>
            </div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                open();
              }}
              className="flex justify-center items-center w-full bg-primary rounded-[8px] p-4 h-[60px] text-xl font-bold cursor-pointer text-white"
            >
              Connect Wallet
            </motion.button>
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
