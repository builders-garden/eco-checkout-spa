import { Separator } from "@/components/shadcn-ui/separator";
import { PageState } from "@/lib/enums";
import { PageStateType } from "@/lib/types";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Loader2, XCircle } from "lucide-react";
import { useState } from "react";

interface TransactionsContainerProps {
  setPageState: (pageState: PageState) => void;
}

export default function TransactionsContainer({
  setPageState,
}: TransactionsContainerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [mockedTransactions, setMockedTransactions] = useState<
    {
      name: string;
      status: "to-send" | "pending" | "completed" | "failed";
    }[]
  >([
    {
      name: "Approve USDC",
      status: "to-send",
    },
    {
      name: "Transfer USDC",
      status: "to-send",
    },
    {
      name: "Approve USDT",
      status: "to-send",
    },
    {
      name: "Bridge USDT",
      status: "to-send",
    },
  ]);

  const handleStart = () => {
    setIsLoading(true);
    // Change the first transaction status to "pending"
    setMockedTransactions((prev) => {
      return prev.map((transaction, index) => {
        if (index === 0) {
          return { ...transaction, status: "pending" };
        }
        return transaction;
      });
    });

    // After 3 seconds, change the first transaction status to "completed"
    setTimeout(() => {
      setMockedTransactions((prev) => {
        return prev.map((transaction, index) => {
          if (index === 0) {
            return { ...transaction, status: "completed" };
          }
          return transaction;
        });
      });

      // Change second transaction status to "pending"
      setMockedTransactions((prev) => {
        return prev.map((transaction, index) => {
          if (index === 1) {
            return { ...transaction, status: "pending" };
          }
          return transaction;
        });
      });

      // After 6 seconds, change the second transaction status to "failed"
      setTimeout(() => {
        setMockedTransactions((prev) => {
          return prev.map((transaction, index) => {
            if (index === 1) {
              return { ...transaction, status: "failed" };
            }
            return transaction;
          });
        });

        setIsLoading(false);
      }, 6000);
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-full sm:max-w-[496px] p-4 gap-4 sm:p-5 border border-secondary-foreground rounded-[8px] overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-col justify-start items-start w-full gap-6 p-4">
        <div className="flex justify-start items-center w-full gap-2">
          <motion.button
            whileTap={{
              scale: 0.95,
            }}
            whileHover={{
              scale: 1.05,
            }}
            className="flex justify-center items-center cursor-pointer pr-1"
            onClick={() => {
              setPageState(PageState.PAYMENT_RECAP);
            }}
          >
            <ArrowLeft className="size-5.5" />
          </motion.button>
          <h1 className="text-xl font-bold">Perform Transactions</h1>
        </div>
        <p className="text-[16px] text-secondary">
          Execute all the listed transactions to complete the payment
        </p>
        <Separator className="w-full" />
      </div>

      {/* Transactions */}
      <div className="flex flex-col justify-start items-start w-full gap-4">
        <h1 className="text-xl font-bold">Transactions</h1>
        <div className="flex flex-col justify-start items-start w-full gap-2">
          {mockedTransactions.map((transaction, index) => (
            <div
              key={index}
              className="flex justify-between items-center w-full"
            >
              <p className="text-[16px] font-semibold">{transaction.name}</p>
              <p className="text-[16px] text-secondary">
                {transaction.status === "pending" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : transaction.status === "completed" ? (
                  <CheckCircle className="size-4 text-green-500" />
                ) : transaction.status === "failed" ? (
                  <XCircle className="size-4 text-red-500" />
                ) : null}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <motion.button
        initial={{ opacity: 0.7 }}
        animate={{
          opacity: isLoading ? 0.7 : 1,
        }}
        whileHover={{
          scale: isLoading ? 1 : 1.02,
        }}
        whileTap={{
          scale: isLoading ? 1 : 0.98,
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleStart}
        className="flex justify-center items-center w-full bg-primary rounded-[8px] p-4 h-[60px] cursor-pointer mt-5"
        type="button"
        disabled={isLoading}
      >
        <p key="start-button" className="text-xl text-white font-bold">
          {isLoading ? <Loader2 className="size-6 animate-spin" /> : "Start"}
        </p>
      </motion.button>
    </motion.div>
  );
}
