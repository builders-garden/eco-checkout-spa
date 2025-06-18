import { ChainImages, TokenImages } from "@/lib/enums";
import { motion } from "framer-motion";
import {
  HookStatus,
  ActionStatus,
  ActionItem,
} from "@/hooks/use-consecutive-wagmi-actions";
import {
  CheckCircle,
  Clock,
  Loader2,
  RotateCw,
  SquareArrowOutUpRight,
} from "lucide-react";
import { cn } from "@/lib/shadcn/utils";

interface TransactionsListProps {
  queuedActions: ActionItem[];
  currentActionIndex: number;
  hookStatus: HookStatus;
}

export const TransactionsList = ({
  queuedActions,
  currentActionIndex,
  hookStatus,
}: TransactionsListProps) => {
  return (
    <div className="relative flex flex-col justify-center items-center bg-secondary-foreground/40 rounded-[8px] p-4 w-full gap-[22px]">
      <motion.div
        animate={{
          height:
            hookStatus === HookStatus.FINISHED
              ? (queuedActions.length - 1) * 60
              : currentActionIndex * 60,
        }}
        transition={{ duration: 0.55 }}
        className="absolute left-[32px] top-[35px] w-[6px] rounded-full bg-success/97"
      />

      {/* Transactions */}
      {queuedActions.map((action, index) => (
        <div
          key={index}
          className="flex justify-between items-center w-full min-h-[44px] sm:min-h-0"
        >
          <div className="flex justify-start items-center w-full gap-3">
            {/* Status */}
            <div className="z-10 bg-secondary-foreground rounded-full">
              <div
                className={cn(
                  "flex justify-center items-center rounded-full size-9.5 transition-all duration-300",
                  action.status === ActionStatus.TO_SEND && "bg-secondary/30",
                  action.status === ActionStatus.PENDING && "bg-blue-400/30",
                  action.status === ActionStatus.SUCCESS && "bg-success/30",
                  action.status === ActionStatus.ERROR && "bg-destructive/30"
                )}
              >
                {action.status === ActionStatus.TO_SEND && (
                  <Clock className="size-5 text-secondary" />
                )}
                {action.status === ActionStatus.PENDING && (
                  <Loader2 className="size-5 text-blue-500 animate-spin" />
                )}
                {action.status === ActionStatus.SUCCESS && (
                  <CheckCircle className="size-5 text-success" />
                )}
                {action.status === ActionStatus.ERROR && (
                  <RotateCw className="size-5 text-destructive" />
                )}
              </div>
            </div>

            <div className="flex justify-center items-center gap-3 sm:gap-5">
              {/* Token */}
              <div className="flex justify-start items-center -space-x-4">
                <div
                  key={index}
                  className="relative flex justify-center items-center"
                >
                  <img
                    src={
                      TokenImages[
                        action.metadata.asset as keyof typeof TokenImages
                      ]
                    }
                    alt={`${action.metadata.asset} logo`}
                    width={31}
                    height={31}
                    className="object-cover rounded-full"
                  />
                  <img
                    src={
                      ChainImages[
                        action.metadata.chain as keyof typeof ChainImages
                      ]
                    }
                    alt={`${action.metadata.chain} logo`}
                    className="absolute bottom-0 right-0 object-cover rounded-full"
                    width={12}
                    height={12}
                  />
                </div>
              </div>

              {/* Action description */}
              <p className="text-[15px] sm:text-[16px] font-semibold">
                {action.metadata.description}
              </p>
            </div>
          </div>

          {/* Tx hashes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              width: "fit-content",
              transition: {
                duration: 0.5,
                ease: "easeInOut",
              },
            }}
            exit={{ opacity: 0 }}
            layout
            className="flex sm:flex-row flex-col justify-center items-end sm:items-center sm:gap-1.5 text-xs underline shrink-0 cursor-pointer"
          >
            {action.txLink && (
              <motion.div
                key={`link-${action.txLink}`}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  scale: [1, 1.025, 1.075, 1.15, 1.075, 1.025, 1],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                layout
                className="flex justify-center items-center gap-1 text-xs underline shrink-0 cursor-pointer"
                onClick={() => window.open(action.txLink!, "_blank")}
              >
                See Tx
                <SquareArrowOutUpRight className="size-3" />
              </motion.div>
            )}
          </motion.div>
        </div>
      ))}
    </div>
  );
};
