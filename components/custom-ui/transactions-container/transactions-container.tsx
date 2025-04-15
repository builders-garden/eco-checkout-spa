import { usePageState } from "@/components/providers/page-state-provider";
import { PageState } from "@/lib/enums";
import { motion } from "framer-motion";

export default function TransactionsContainer() {
  const { setPageState } = usePageState();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-full sm:max-w-[496px] p-4 sm:p-5 gap-4 border border-secondary-foreground rounded-[8px] overflow-hidden"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">Work in progress!</p>
        <button onClick={() => setPageState(PageState.PAYMENT_RECAP)}>
          Go back
        </button>
      </div>
    </motion.div>
  );
}
