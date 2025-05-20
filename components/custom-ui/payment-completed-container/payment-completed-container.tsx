import { CheckCircle, ChevronDown, SquareArrowOutUpRight } from "lucide-react";
import { CustomButton } from "../customButton";
import { motion } from "framer-motion";
import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { OperationLabel } from "../transactions-container/operation-label";
import { ChainImages, TokenImages } from "@/lib/enums";
import { useTransactionSteps } from "@/components/providers/transaction-steps-provider";

export default function PaymentCompletedContainer() {
  const { paymentParams } = usePaymentParams();
  const { amountDue, redirect } = paymentParams;
  const { transactionSteps } = useTransactionSteps();

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-start items-center size-full min-h-screen sm:min-h-0 sm:max-w-[496px] p-4.5 sm:p-8 gap-6 sm:gap-9 sm:border sm:border-secondary-foreground sm:rounded-[8px] overflow-hidden"
    >
      {/* Check Circle */}
      <div className="flex justify-center items-center rounded-full size-[70px] bg-success/30">
        <CheckCircle className="size-9 text-success" />
      </div>

      {/* Title */}
      <div className="flex flex-col justify-center items-center gap-1">
        <h1 className="text-2xl font-bold">Payment complete!</h1>
        <p className="text-[15px] text-center text-secondary">
          Your payment of{" "}
          <span className="font-bold">${amountDue?.toFixed(2)}</span> has been
          sent successfully
        </p>
      </div>

      {/* Transactions */}
      <div className="relative flex flex-col justify-center items-center bg-secondary-foreground/40 rounded-[8px] p-4 sm:mb-0 mb-10 w-full gap-[22px]">
        {transactionSteps.map((step, index) => (
          <div
            key={index}
            className="flex justify-between items-center w-full min-h-[44px] sm:min-h-0"
          >
            <div className="flex justify-start items-center w-full gap-3">
              <div className="flex justify-center items-center gap-4 sm:gap-5">
                {/* Tokens */}
                <div className="flex justify-start items-center -space-x-4">
                  {step.assets.map((token, index) => (
                    <div
                      key={index}
                      className="relative flex justify-center items-center"
                    >
                      <img
                        src={
                          TokenImages[token.asset as keyof typeof TokenImages]
                        }
                        alt={`${token.chain} logo`}
                        width={31}
                        height={31}
                        className="object-cover rounded-full"
                      />
                      {index === step.assets.length - 1 && (
                        <img
                          src={ChainImages[token.chain]}
                          alt={`${token.chain} logo`}
                          className="absolute bottom-0 right-0 object-cover rounded-full"
                          width={12}
                          height={12}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Action description */}
                <OperationLabel step={step} />
              </div>
            </div>

            {/* Tx hashes */}
            <div className="flex sm:flex-row flex-col justify-center items-end sm:items-center sm:gap-1.5 text-xs underline shrink-0 cursor-pointer">
              {step.originTransaction && (
                <div
                  className="flex justify-center items-center gap-1 text-xs underline shrink-0 cursor-pointer"
                  onClick={() =>
                    window.open(step.originTransaction!.link, "_blank")
                  }
                >
                  {step.type === "intent" ? "Initial Transfer" : "Transfer"}
                  <SquareArrowOutUpRight className="size-3" />
                </div>
              )}

              {step.type === "intent" && step.destinationTransaction && (
                <>
                  <div className="flex w-full justify-center items-center">
                    <ChevronDown className="size-3 sm:rotate-270" />
                  </div>
                  <div
                    className="flex justify-center items-center gap-1 text-xs underline shrink-0 cursor-pointer"
                    onClick={() =>
                      window.open(step.destinationTransaction!.link, "_blank")
                    }
                  >
                    Fulfillment
                    <SquareArrowOutUpRight className="size-3" />
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Redirect Button */}
      {redirect && (
        <CustomButton
          text="Return to application"
          onClick={() => {
            window.location.href = redirect;
          }}
        />
      )}
    </motion.div>
  );
}
