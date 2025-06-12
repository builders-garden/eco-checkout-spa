import { cn } from "@/lib/shadcn/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useMeasure } from "@uidotdev/usehooks";

const ignoreCircularReferences = () => {
  const seen = new WeakSet();
  return (key: string, value: any) => {
    if (key.startsWith("_")) return; // Don't compare React's internal props.
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return;
      seen.add(value);
    }
    return value;
  };
};

interface ResizablePanelProps {
  children: React.ReactNode;
  initialHeight?: number;
}

export function ResizablePanel({
  children,
  initialHeight,
}: ResizablePanelProps) {
  let [ref, { height }] = useMeasure();

  return (
    <motion.div
      animate={{ height: height || initialHeight || "auto" }}
      transition={{ ease: "linear" }}
      className={cn("overflow-hidden size-full")}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={JSON.stringify(children, ignoreCircularReferences())}
          ref={ref}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
