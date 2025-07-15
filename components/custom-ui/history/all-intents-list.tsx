import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/shadcn-ui/pagination";
import { IntentData } from "@/lib/relayoor/types";
import { PaginationState } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { SingleIntentCard } from "./single-intent-card";
import { ArrowLeft } from "lucide-react";

interface AllIntentsListProps {
  setIntentGroupID: (intentGroupID: string | null) => void;
  selectedPayment: IntentData[];
}

export const AllIntentsList = ({
  setIntentGroupID,
  selectedPayment,
}: AllIntentsListProps) => {
  // Calculate the intents length
  const intentsLength = selectedPayment.length;

  // Pagination State and constants
  const [paginationState, setPaginationState] = useState<PaginationState>({
    currentPage: 1,
    previousPage: 1,
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(intentsLength / itemsPerPage);

  // Get a paginated array of intents
  const paginatedIntents = useMemo(() => {
    return selectedPayment.slice(
      (paginationState.currentPage - 1) * itemsPerPage,
      paginationState.currentPage * itemsPerPage
    );
  }, [selectedPayment, paginationState, itemsPerPage]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto p-6 bg-background"
    >
      {/* Header */}
      <div className="relative text-center sm:mb-8 mb-6 w-full">
        <motion.button
          whileHover={{ translateX: [0, -10, 0] }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute left-0 top-1 sm:h-full h-fit flex justify-center items-center cursor-pointer"
          onClick={() => {
            setIntentGroupID(null);
          }}
        >
          <ArrowLeft className="size-8 text-muted-foreground" />
        </motion.button>
        <h1 className="text-[27px] font-bold text-foreground sm:mb-2">
          Payment Details
        </h1>
        <p className="text-secondary text-lg">
          All the intents included in this payment
        </p>
      </div>

      {/* Transaction List */}
      <div className="flex flex-col justify-start items-center w-full gap-3">
        <AnimatePresence mode="wait" custom={paginationState}>
          <div
            key={paginationState.currentPage}
            className="flex flex-col justify-start items-center w-full gap-3"
          >
            {paginatedIntents.map((intent, index) => (
              <SingleIntentCard
                key={intent.hash}
                intent={intent}
                index={index}
                paginationState={paginationState}
              />
            ))}
          </div>
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
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
      )}
    </motion.div>
  );
};
