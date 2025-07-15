import { AnimatePresence, motion } from "framer-motion";
import { PaginationState } from "@/lib/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/shadcn-ui/pagination";
import { IntentData } from "@/lib/relayoor/types";
import { TransactionHistoryCard } from "./transaction-history-card";
import { useMemo } from "react";

interface AllTransactionsListProps {
  history: Record<string, IntentData[]>;
  historyLength: number;
  paginationState: PaginationState;
  setPaginationState: (
    state: (prev: PaginationState) => PaginationState
  ) => void;
}

export const AllTransactionsList = ({
  history,
  historyLength,
  paginationState,
  setPaginationState,
}: AllTransactionsListProps) => {
  // Pagination calculations
  const itemsPerPage = 5;
  const totalPages = Math.ceil(historyLength / itemsPerPage);

  // Get a subobject of the history based on the pagination state
  const paginatedHistory = useMemo(() => {
    if (!history) return {};
    const entries = Object.entries(history);
    const start = (paginationState.currentPage - 1) * itemsPerPage;
    const end = paginationState.currentPage * itemsPerPage;
    return Object.fromEntries(entries.slice(start, end));
  }, [history, paginationState, itemsPerPage]);

  // Helper to generate pagination items with ellipsis
  const getPaginationItems = (current: number, total: number) => {
    if (total <= 6) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, "...", total];
    }
    if (current >= total - 2) {
      return [1, "...", total - 2, total - 1, total];
    }
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto p-6 bg-background"
    >
      {/* Header */}
      <div className="text-center sm:mb-8 mb-6">
        <h1 className="text-[27px] font-bold text-foreground sm:mb-2">
          Payment history
        </h1>
        <p className="text-secondary text-lg">Your recent payment activity</p>
      </div>

      {/* Transaction List */}
      <div className="flex flex-col justify-start items-center w-full gap-3">
        <AnimatePresence mode="wait" custom={paginationState}>
          <div
            key={paginationState.currentPage}
            className="flex flex-col justify-start items-center w-full gap-3"
          >
            {Object.entries(paginatedHistory).map(
              ([intentGroupID, paymentTransactions], index) => (
                <TransactionHistoryCard
                  key={intentGroupID}
                  index={index}
                  intentGroupID={intentGroupID}
                  paymentTransactions={paymentTransactions}
                  paginationState={paginationState}
                />
              )
            )}
          </div>
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 sm:mt-8 sm:mb-0 mb-8">
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
              {getPaginationItems(paginationState.currentPage, totalPages).map(
                (item, i) => (
                  <PaginationItem key={i}>
                    {item === "..." ? (
                      <span className="px-2">...</span>
                    ) : (
                      <PaginationLink
                        isActive={paginationState.currentPage === item}
                        onClick={() =>
                          setPaginationState((prev) => ({
                            previousPage: prev.currentPage,
                            currentPage: item as number,
                          }))
                        }
                        className="cursor-pointer"
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                )
              )}
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
      )}
    </motion.div>
  );
};
