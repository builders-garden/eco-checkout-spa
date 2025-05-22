import {
  chainIdToChain,
  chainIdToChainName,
  truncateAddress,
} from "@/lib/utils";
import { Separator } from "../../shadcn-ui/separator";
import { ChainImages } from "@/lib/enums";
import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { PoweredByCapsule } from "../powered-by-capsule";
import { useNames } from "@/components/providers/names-provider";
import AnimatedName from "../animated-name";
import { useTransactionSteps } from "@/components/providers/transaction-steps-provider";
import { motion } from "framer-motion";

export const PaymentSummary = () => {
  const { recipientNames } = useNames();
  const { paymentParams } = usePaymentParams();
  const { recipient, desiredNetworkId, amountDue, showFees } = paymentParams;
  const { totalNetworkFee } = useTransactionSteps();

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
          {recipient && (
            <AnimatedName
              name={recipientNames.preferredName}
              address={truncateAddress(recipient)}
              isFetchingName={recipientNames.isFetching}
            />
          )}
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
        {showFees && (
          <>
            {/* Amount */}
            <div className="flex justify-between items-center w-full gap-2">
              <p className="text-[16px] text-secondary">Amount</p>
              <motion.p
                key={amountDue! - totalNetworkFee}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[16px] font-semibold"
              >
                ${(amountDue! - totalNetworkFee).toFixed(2)}
              </motion.p>
            </div>
            {/* Network Fee */}
            <div className="flex justify-between items-center w-full gap-2">
              <p className="text-[16px] text-secondary">Network Fee</p>
              <motion.p
                key={totalNetworkFee}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-[16px] font-semibold"
              >
                {totalNetworkFee < 0.01
                  ? "< $0.01"
                  : `$${totalNetworkFee.toFixed(2)}`}
              </motion.p>
            </div>
          </>
        )}
        {/* Total */}
        <div className="flex justify-between items-center w-full gap-2">
          <p className="text-lg font-semibold">Total</p>
          <motion.p
            key={amountDue! - totalNetworkFee - 100}
            initial={{ opacity: showFees ? 0 : 1, x: showFees ? 10 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-semibold"
          >
            ${amountDue!.toFixed(2)}
          </motion.p>
        </div>
      </div>
    </div>
  );
};
