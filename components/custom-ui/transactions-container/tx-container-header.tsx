import { Separator } from "@/components/shadcn-ui/separator";
import { PoweredByCapsule } from "../powered-by-capsule";
import { twoDecimalsSlicingString } from "@/lib/utils";

interface TxContainerHeaderProps {
  amountDue: number;
  humanReadableProtocolFee: number;
}

export const TxContainerHeader = ({
  amountDue,
  humanReadableProtocolFee,
}: TxContainerHeaderProps) => {
  return (
    <div className="flex flex-col justify-start items-start sm:p-4 gap-6">
      <div className="flex justify-between items-center w-full mb-1">
        <h1 className="text-[22px] font-bold">Process Payment</h1>
        <PoweredByCapsule />
      </div>

      {/* Total Amount */}
      <div className="flex justify-between items-center w-full">
        <p className="text-[16px] text-secondary">Total amount</p>
        <p className="text-[16px] font-semibold">
          ${twoDecimalsSlicingString(amountDue! + humanReadableProtocolFee)}
        </p>
      </div>

      <Separator className="w-full" />
    </div>
  );
};
