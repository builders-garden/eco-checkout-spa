import {
  chainIdToChain,
  chainIdToChainName,
  truncateAddress,
} from "@/lib/utils";
import { Separator } from "../shadcn-ui/separator";
import { emptyAddress } from "@/lib/constants";
import { ChainImages } from "@/lib/enums";

interface PaymentSummaryProps {
  recipient: string;
  desiredNetworkId: string;
  amountDue: number;
}

export const PaymentSummary = ({
  recipient,
  desiredNetworkId,
  amountDue,
}: PaymentSummaryProps) => {
  const desiredNetworkNumber = Number(desiredNetworkId);
  const networkName = chainIdToChainName(desiredNetworkNumber);

  return (
    <div className="flex flex-col justify-start items-start p-4 gap-6">
      {/* Header */}
      <h1 className="text-xl font-bold">Payment Summary</h1>

      {/* Info */}
      <div className="flex flex-col w-full gap-3">
        {/* Recipient */}
        <div className="flex justify-between items-center w-full gap-2">
          <p className="text-[16px] text-secondary">Recipient</p>
          <p className="text-[16px] font-semibold">
            {truncateAddress(recipient ?? emptyAddress)}
          </p>
        </div>
        {/* To Chain */}
        <div className="flex justify-between items-center w-full gap-2">
          <p className="text-[16px] text-secondary">To Chain</p>
          <div className="flex justify-center items-center gap-1.5">
            <p className="text-[16px] font-semibold">{networkName}</p>
            <img
              src={
                ChainImages[
                  chainIdToChain(
                    desiredNetworkNumber,
                    true
                  ) as keyof typeof ChainImages
                ]
              }
              alt={desiredNetworkId}
              className="size-5"
            />
          </div>
        </div>
      </div>

      <Separator className="w-full" />

      <div className="flex flex-col w-full">
        {/* Total */}
        <div className="flex justify-between items-center w-full gap-2">
          <p className="text-lg font-semibold">Amount</p>
          <p className="text-lg font-semibold">${amountDue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};
