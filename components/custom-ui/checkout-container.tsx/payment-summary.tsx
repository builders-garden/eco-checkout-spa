import {
  chainIdToChain,
  chainIdToChainName,
  truncateAddress,
} from "@/lib/utils";
import { Separator } from "../../shadcn-ui/separator";
import { EMPTY_ADDRESS } from "@/lib/constants";
import { ChainImages } from "@/lib/enums";
import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { PoweredByCapsule } from "../powered-by-capsule";

export const PaymentSummary = () => {
  const { paymentParams } = usePaymentParams();
  const { recipient, desiredNetworkId, amountDue } = paymentParams;

  const networkName = chainIdToChainName(desiredNetworkId!);

  return (
    <div className="flex flex-col justify-start items-start sm:p-4 gap-6">
      {/* Header */}
      <div className="flex justify-between items-center w-full mb-2 mt-1 gap-2">
        <h1 className="text-[22px] font-bold leading-6">Payment Summary</h1>
        <PoweredByCapsule />
      </div>

      {/* Info */}
      <div className="flex flex-col w-full gap-3">
        {/* Recipient */}
        <div className="flex justify-between items-center w-full gap-2">
          <p className="text-[16px] text-secondary">Recipient</p>
          <p className="text-[16px] font-semibold">
            {truncateAddress(recipient ?? EMPTY_ADDRESS)}
          </p>
        </div>
        {/* To Chain */}
        <div className="flex justify-between items-center w-full gap-2">
          <p className="text-[16px] text-secondary">To Chain</p>
          <div className="flex justify-center items-center gap-[5px]">
            <p className="text-[16px] font-semibold">{networkName}</p>
            <img
              src={
                ChainImages[
                  chainIdToChain(
                    desiredNetworkId!,
                    true
                  ) as keyof typeof ChainImages
                ]
              }
              alt={desiredNetworkId!.toString()}
              className="size-5 rounded-full object-cover"
            />
          </div>
        </div>
      </div>

      <Separator className="w-full" />

      <div className="flex flex-col w-full gap-2">
        {/* Total */}
        <div className="flex justify-between items-center w-full gap-2">
          <p className="text-lg font-semibold">Total</p>
          <p className="text-lg font-semibold">${amountDue!.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};
