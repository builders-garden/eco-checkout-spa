"use client";

import { AnimatePresence, motion } from "framer-motion";
import { InfoFooter } from "@/components/custom-ui/info-footer";
import { useState } from "react";
import { HistoryPageState } from "@/lib/enums";
import { AllTransactionsList } from "@/components/custom-ui/history/all-transactions-list";

export default function Home() {
  // History Page State
  const [historyPageState, setHistoryPageState] = useState<HistoryPageState>(
    HistoryPageState.HISTORY
  );

  // Selected Payment
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  return (
    <main className="flex relative flex-col items-center justify-start sm:justify-center min-h-screen h-auto sm:pt-6 sm:pb-14 overflow-y-auto [background-image:radial-gradient(#00000009_1px,transparent_1px)] [background-size:16px_16px]">
      <AnimatePresence mode="wait">
        {historyPageState === HistoryPageState.HISTORY ? (
          <AllTransactionsList
            setHistoryPageState={setHistoryPageState}
            setSelectedPayment={setSelectedPayment}
            key="all-transactions-list"
          />
        ) : historyPageState === HistoryPageState.PAYMENT && selectedPayment ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              setHistoryPageState(HistoryPageState.HISTORY);
              setSelectedPayment(null);
            }}
            className="border rounded-lg p-4 cursor-pointer"
          >
            Hello World
          </motion.div>
        ) : null}
      </AnimatePresence>
      <InfoFooter />
    </main>
  );
}
