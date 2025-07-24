import { IntentData } from "@/lib/relayoor/types";
import { PaginationState } from "@/lib/types";
import {
  capitalizeFirstLetter,
  chainIdToChain,
  getDateFromRelayoorTimestamp,
  getHumanReadableAmount,
  getPaginationVariants,
  getTimeFromRelayoorTimestamp,
  getTokenSymbolFromAddress,
  truncateAddress,
} from "@/lib/utils";
import { motion } from "framer-motion";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { ChainImages } from "@/lib/enums";

interface TransactionHistoryCardProps {
  intentGroupID: string;
  paymentTransactions: IntentData[];
  index: number;
  paginationState: PaginationState;
}

export const TransactionHistoryCard = ({
  intentGroupID,
  paymentTransactions,
  index,
  paginationState,
}: TransactionHistoryCardProps) => {
  // Get the intentGroupID from the query params
  const setIntentGroupID = useQueryState("intentGroupID")[1];

  // Pagination Variants
  const variants = getPaginationVariants();

  // Get the destination token symbol
  const destinationTokenSymbol = useMemo(() => {
    if (paymentTransactions.length === 0) return undefined;
    return getTokenSymbolFromAddress(
      Number(paymentTransactions[0].params.destination),
      paymentTransactions[0].params.routeTokens[0].token
    );
  }, [paymentTransactions]);

  // Get the destination chain id
  const destinationChainName = useMemo(() => {
    if (paymentTransactions.length === 0) return undefined;
    try {
      return chainIdToChain(
        Number(paymentTransactions[0].params.destination),
        true
      ) as keyof typeof ChainImages;
    } catch (error) {
      return undefined;
    }
  }, [paymentTransactions]);

  // Calculate the amount of the transaction in raw format
  const payedAmountRaw = useMemo(() => {
    if (paymentTransactions.length === 0) return undefined;
    return paymentTransactions.reduce((acc, transaction) => {
      return (
        acc +
        transaction.params.rewardTokens.reduce((acc, token) => {
          return acc + Number(token.amount);
        }, 0)
      );
    }, 0);
  }, [paymentTransactions]);

  // Calculate the date and exact time of the intent
  const [date, time] = useMemo(() => {
    if (paymentTransactions.length === 0) return [undefined, undefined];
    return [
      getDateFromRelayoorTimestamp(paymentTransactions[0].createdAt),
      getTimeFromRelayoorTimestamp(paymentTransactions[0].createdAt),
    ];
  }, [paymentTransactions]);

  // Calculate if the transaction is completed or partially completed
  const isCompleted = useMemo(() => {
    return paymentTransactions.every(
      (transaction) => transaction.transactionHash !== "undefined"
    );
  }, [paymentTransactions]);

  // Calculate the recipient address
  const recipientAddress = useMemo(() => {
    if (paymentTransactions.length === 0) return undefined;
    const destinationChain = Number(paymentTransactions[0].params.destination);
    return paymentTransactions[0].v2GaslessIntentData.permitData.permit3.allowanceOrTransfers.find(
      (transfer) => transfer.chainID === destinationChain
    )?.account;
  }, [paymentTransactions]);

  return (
    <motion.button
      key={`${paginationState.currentPage}-${index}`}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={paginationState}
      transition={{ duration: 0.2, delay: index * 0.075 }}
      onClick={() => {
        setIntentGroupID(intentGroupID);
      }}
      className="flex items-center justify-between w-full p-4 border border-border rounded-[8px] bg-card hover:bg-accent/50 transition-colors cursor-pointer"
    >
      {/* Left side - Amount and destination */}
      <div className="flex flex-col gap-1">
        <div className="flex sm:flex-row flex-col items-center gap-2">
          {payedAmountRaw && (
            <span className="sm:text-xl text-lg leading-tight font-bold text-foreground text-left">
              {getHumanReadableAmount(payedAmountRaw, 6)}{" "}
              {destinationTokenSymbol}
            </span>
          )}
          {recipientAddress && (
            <span className="hidden sm:block">
              to {truncateAddress(recipientAddress, 4)}
            </span>
          )}
        </div>
        {destinationChainName && (
          <div className="flex items-center gap-1 sm:h-auto h-[26px]">
            <img
              src={ChainImages[destinationChainName]}
              alt={destinationChainName}
              className="size-5"
            />
            <span className="text-sm text-muted-foreground">
              {capitalizeFirstLetter(destinationChainName)}
            </span>
          </div>
        )}
      </div>

      {/* Right side - Date, hash, and status */}
      <div className="flex sm:flex-row flex-col justify-center sm:items-center items-end sm:gap-6 gap-1">
        <div className="flex flex-col justify-center items-start gap-1">
          {date && time && (
            <div className="text-foreground font-medium">
              {date} • {time}
            </div>
          )}
          <div className="sm:flex hidden items-center justify-end">
            <p className="text-sm text-muted-foreground">
              TODO: Add destination hash
            </p>
          </div>
        </div>

        <div
          className={`flex justify-center items-center gap-2 rounded-full border px-2.5 py-0.5 ${
            isCompleted
              ? "bg-success/80 border-success/10"
              : "bg-destructive/80 border-destructive/10"
          }`}
        >
          <p className="text-sm text-white font-semibold">
            {isCompleted ? "Completed" : "Failed"}
          </p>
        </div>
      </div>
    </motion.button>
  );
};
