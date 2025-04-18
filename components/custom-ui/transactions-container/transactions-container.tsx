import { PageState } from "@/lib/enums";
import { PageStateType } from "@/lib/types";
import { animate, motion } from "framer-motion";

interface TransactionsContainerProps {
  pageState: PageStateType;
  setPageState: (pageState: PageState) => void;
}

export default function TransactionsContainer({
  pageState,
  setPageState,
}: TransactionsContainerProps) {
  const variants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: (custom: PageStateType) => ({
      opacity: 0,
      x: custom.current === PageState.PAYMENT_RECAP ? 100 : 0,
    }),
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={pageState}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-full sm:max-w-[496px] p-4 sm:p-5 gap-4 border border-secondary-foreground rounded-[8px] overflow-hidden"
    >
      <div className="flex flex-col justify-center w-full items-center gap-4">
        <p className="text-md text-primary">Work in progress here!</p>
        <button
          onClick={() => setPageState(PageState.PAYMENT_RECAP)}
          className="cursor-pointer px-2 py-1 rounded-md bg-primary text-primary-foreground w-[70%]"
        >
          Go back
        </button>
      </div>
    </motion.div>
  );
}
