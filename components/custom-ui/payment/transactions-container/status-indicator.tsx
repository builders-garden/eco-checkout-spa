import { Clock, Loader2, RotateCw } from "lucide-react";
import { TransactionStatus } from "@/lib/enums";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/shadcn/utils";

interface StatusIndicatorProps {
  status: TransactionStatus;
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  return (
    <div className="z-10 bg-secondary-foreground rounded-full">
      <div
        className={cn(
          "flex justify-center items-center rounded-full size-9.5 transition-all duration-300",
          status === TransactionStatus.TO_SEND && "bg-secondary/30",
          status === TransactionStatus.AWAITING_CONFIRMATION &&
            "bg-blue-400/30",
          status === TransactionStatus.SUCCESS && "bg-success/30",
          status === TransactionStatus.ERROR && "bg-destructive/30"
        )}
      >
        {status === TransactionStatus.TO_SEND && (
          <Clock className="size-5 text-secondary" />
        )}
        {status === TransactionStatus.AWAITING_CONFIRMATION && (
          <Loader2 className="size-5 text-blue-500 animate-spin" />
        )}
        {status === TransactionStatus.SUCCESS && (
          <CheckCircle className="size-5 text-success" />
        )}
        {status === TransactionStatus.ERROR && (
          <RotateCw className="size-5 text-destructive" />
        )}
      </div>
    </div>
  );
}
