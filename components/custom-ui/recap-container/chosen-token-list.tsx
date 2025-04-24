import { useTransactionSteps } from "@/components/providers/transaction-steps-provider";
import { TokenSymbols } from "@/lib/enums";
import { TokenImages } from "@/lib/enums";
import { ChainImages } from "@/lib/enums";
import { capitalizeFirstLetter } from "@/lib/utils";
import { CreditCard } from "lucide-react";

export const ChosenTokenList = () => {
  const { transactionSteps } = useTransactionSteps();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-start items-center gap-1.5">
        <CreditCard className="size-4 text-secondary" />
        <p className="text-sm text-secondary">Payment method</p>
      </div>
      {transactionSteps.map((step, index) => {
        if (step.type !== "approve") {
          return (
            <div key={`${step.type}-${index}`} className="flex flex-col gap-2">
              {step.assets.map((token) => (
                <div
                  key={`${token.tokenContractAddress}`}
                  className="flex justify-between items-center bg-accent rounded-[8px] py-2 px-4"
                >
                  <div className="flex justify-start items-center gap-2">
                    <div className="relative flex justify-center items-center">
                      <img
                        src={
                          TokenImages[token.asset as keyof typeof TokenImages]
                        }
                        alt={`${token.chain} logo`}
                        width={31}
                        height={31}
                        className="object-cover rounded-full"
                      />
                      <img
                        src={ChainImages[token.chain]}
                        alt={`${token.chain} logo`}
                        className="absolute bottom-0 right-0 object-cover rounded-full"
                        width={12}
                        height={12}
                      />
                    </div>
                    <div className="flex flex-col justify-center items-start">
                      <p className="text-sm text-primary font-semibold leading-4">
                        {TokenSymbols[token.asset as keyof typeof TokenSymbols]}
                      </p>
                      <p className="text-xs text-secondary">
                        {capitalizeFirstLetter(token.chain)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-end">
                    <p className="text-sm text-primary font-semibold">
                      ${token.amountToSend / 10 ** token.decimals}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          );
        }
      })}
    </div>
  );
};
