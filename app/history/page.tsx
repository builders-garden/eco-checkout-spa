"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChainImages } from "@/lib/enums";
import { InfoFooter } from "@/components/custom-ui/info-footer";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/shadcn-ui/pagination";
import { PaginationState } from "@/lib/types";
import { getPaginationVariants } from "@/lib/utils";

interface PaymentTransaction {
  amount: string;
  currency: string;
  toAddress: string;
  network: string;
  date: string;
  time: string;
  transactionHash: string;
  status: "completed" | "pending";
}

const mockTransaction: PaymentTransaction = {
  amount: "12.00",
  currency: "USDC",
  toAddress: "0x13...bC62",
  network: "Base",
  date: "26/05/2025",
  time: "1:12 PM",
  transactionHash: "0x66...a3c0",
  status: "completed",
};

const mockedTransactions: PaymentTransaction[] = Array.from(
  { length: 15 },
  (_) => ({
    ...mockTransaction,
  })
);

export default function Home() {
  // History Page State
  //   const [historyPageState, setHistoryPageState] = useState<HistoryPageState>(
  //     HistoryPageState.HISTORY
  //   );

  // Selected Payment
  //const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [paginationState, setPaginationState] = useState<PaginationState>({
    currentPage: 1,
    previousPage: 1,
  });
  const itemsPerPage = 5;
  const totalPages = Math.ceil(mockedTransactions.length / itemsPerPage);

  const paginatedTransactions = mockedTransactions.slice(
    (paginationState.currentPage - 1) * itemsPerPage,
    paginationState.currentPage * itemsPerPage
  );

  // Pagination Variants
  const variants = getPaginationVariants();

  return (
    <main className="flex relative flex-col items-center justify-start sm:justify-center min-h-screen h-auto sm:pt-6 sm:pb-14 overflow-y-auto [background-image:radial-gradient(#00000009_1px,transparent_1px)] [background-size:16px_16px]">
      <AnimatePresence mode="wait">
        <div className="w-full max-w-3xl mx-auto p-6 bg-background">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-[27px] font-bold text-foreground mb-2">
              Payment history
            </h1>
            <p className="text-secondary text-lg">
              Your recent payment activity
            </p>
          </div>

          {/* Transaction List */}
          <div className="flex flex-col justify-start items-center w-full gap-3">
            <AnimatePresence mode="wait" custom={paginationState}>
              {paginatedTransactions.map((transaction, index) => (
                <motion.div
                  key={`${paginationState.currentPage}-${index}`}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  custom={paginationState}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className="flex items-center justify-between w-full p-4 border border-border sm:rounded-[8px] bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  {/* Left side - Amount and destination */}
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-foreground">
                          {transaction.amount} {transaction.currency}
                        </span>
                        <span className="text-muted-foreground">
                          to {transaction.toAddress}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <img
                          src={
                            ChainImages[
                              transaction.network as keyof typeof ChainImages
                            ]
                          }
                          alt={transaction.network}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-muted-foreground">
                          {transaction.network}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Date, hash, and status */}
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-foreground font-medium">
                        {transaction.date} • {transaction.time}
                      </div>
                      <div className="flex items-center space-x-1 mt-1 justify-end">
                        <span className="text-sm text-muted-foreground">
                          {transaction.transactionHash}
                        </span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="flex justify-center items-center gap-2 rounded-full border-success/10 border bg-success/40 px-2 py-0.5">
                      <p className="text-sm text-success font-semibold">
                        Completed
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setPaginationState((prev) => ({
                        previousPage: prev.currentPage,
                        currentPage: Math.max(prev.currentPage - 1, 1),
                      }))
                    }
                    className={
                      paginationState.currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      isActive={paginationState.currentPage === i + 1}
                      onClick={() =>
                        setPaginationState((prev) => ({
                          previousPage: prev.currentPage,
                          currentPage: i + 1,
                        }))
                      }
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setPaginationState((prev) => ({
                        previousPage: prev.currentPage,
                        currentPage: Math.min(prev.currentPage + 1, totalPages),
                      }))
                    }
                    className={
                      paginationState.currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </AnimatePresence>
      <InfoFooter />
    </main>
  );
}
