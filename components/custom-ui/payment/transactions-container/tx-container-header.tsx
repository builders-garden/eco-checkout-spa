import { Separator } from "@/components/shadcn-ui/separator";
import { PoweredByCapsule } from "@/components/custom-ui/powered-by-capsule";

interface TxContainerHeaderProps {
  amountDue: number;
}

export const TxContainerHeader = ({ amountDue }: TxContainerHeaderProps) => {
  return (
    <div className="flex flex-col justify-start items-start sm:p-4 gap-6">
      <div className="flex justify-between items-center w-full mb-2 mt-1 gap-2">
        <h1 className="text-[22px] font-bold leading-6">Process Payment</h1>
        <PoweredByCapsule />
      </div>

      {/* Total Amount */}
      <div className="flex justify-between items-center w-full">
        <p className="text-[16px] text-secondary">Total amount</p>
        <p className="text-[16px] font-semibold">${amountDue!.toFixed(2)}</p>
      </div>

      <Separator className="w-full" />
    </div>
  );
};
