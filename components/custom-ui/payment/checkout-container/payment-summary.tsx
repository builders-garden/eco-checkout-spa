import {
  capitalizeFirstLetter,
  getHumanReadableAmount,
  truncateAddress,
} from "@/lib/utils";
import { Separator } from "@/components/shadcn-ui/separator";
import { ChainImages } from "@/lib/enums";
import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { PoweredByCapsule } from "@/components/custom-ui/powered-by-capsule";
import { useNames } from "@/components/providers/names-provider";
import AnimatedName from "@/components/custom-ui/animated-name";
import { motion } from "framer-motion";
import { useSelectedTokens } from "@/components/providers/selected-tokens-provider";
import { useEffect, useMemo } from "react";

export const PaymentSummary = () => {
  const { recipientNames } = useNames();
  const { sendIntents } = useSelectedTokens();
  const { paymentParams, desiredNetworkString } = usePaymentParams();
  const { recipient, amountDue, showFees } = paymentParams;

  const networkName = capitalizeFirstLetter(desiredNetworkString ?? "");

  // Calculate the total network fees from the sendIntents
  const totalNetworkFee = useMemo(() => {
    return sendIntents.reduce((acc, intent) => {
      const routeData = intent.routeData;
      const rewardData = intent.rewardData;
      const chainFees =
        rewardData.tokens.reduce((acc, token) => {
          return acc + Number(token.amount);
        }, 0) -
        routeData.tokens.reduce((acc, token) => {
          return acc + Number(token.amount);
        }, 0);
      return acc + chainFees;
    }, 0);
  }, [sendIntents]);

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
              className="w-[33%]"
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
                ChainImages[desiredNetworkString as keyof typeof ChainImages]
              }
              alt={desiredNetworkString}
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
                key={amountDue!}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[16px] font-semibold"
              >
                ${amountDue!.toFixed(2)}
              </motion.p>
            </div>
            {/* Network Fee */}
            <div className="flex justify-between items-center w-full gap-2">
              <p className="text-[16px] text-secondary">Network Fee</p>
              <motion.p
                key={"0"}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-[16px] font-semibold"
              >
                ${getHumanReadableAmount(totalNetworkFee, 6)}
              </motion.p>
            </div>
          </>
        )}
        {/* Total */}
        <div className="flex justify-between items-center w-full gap-2">
          <p className="text-lg font-semibold">Total</p>
          <motion.p
            key={amountDue!}
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
