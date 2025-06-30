import { ActionStatus } from "@/hooks/use-consecutive-wagmi-actions";
import { cn } from "@/lib/shadcn/utils";
import { Clock, Loader2, CheckCircle, RotateCw } from "lucide-react";

interface TransactionStatusIconProps {
  status: ActionStatus;
}

export const TransactionStatusIcon = ({
  status,
}: TransactionStatusIconProps) => {
  return (
    <div className="z-10 bg-secondary-foreground rounded-full">
      <div
        className={cn(
          "flex justify-center items-center rounded-full size-9.5 transition-all duration-300",
          status === ActionStatus.TO_SEND && "bg-secondary/30",
          status === ActionStatus.PENDING && "bg-blue-400/30",
          status === ActionStatus.SUCCESS && "bg-success/30",
          status === ActionStatus.ERROR && "bg-destructive/30"
        )}
      >
        {status === ActionStatus.TO_SEND && (
          <Clock className="size-5 text-secondary" />
        )}
        {status === ActionStatus.PENDING && (
          <Loader2 className="size-5 text-blue-500 animate-spin" />
        )}
        {status === ActionStatus.SUCCESS && (
          <CheckCircle className="size-5 text-success" />
        )}
        {status === ActionStatus.ERROR && (
          <RotateCw className="size-5 text-destructive" />
        )}
      </div>
    </div>
  );
};
