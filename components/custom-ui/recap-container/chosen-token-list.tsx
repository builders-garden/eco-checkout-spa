import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { useSelectedTokens } from "@/components/providers/selected-tokens-provider";
import { TokenSymbols } from "@/lib/enums";
import { TokenImages } from "@/lib/enums";
import { ChainImages } from "@/lib/enums";
import { capitalizeFirstLetter, getAmountDeducted } from "@/lib/utils";
import { CreditCard } from "lucide-react";

export const ChosenTokenList = () => {
  const { selectedTokens } = useSelectedTokens();
  const { paymentParams } = usePaymentParams();
  const { amountDue } = paymentParams;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-start items-center gap-1.5">
        <CreditCard className="size-4 text-secondary" />
        <p className="text-sm text-secondary">Payment method</p>
      </div>
      {selectedTokens.map((token) => (
        <div
          key={`${token.asset}-${token.chain}`}
          className="flex justify-between items-center bg-accent rounded-[8px] py-2 px-4"
        >
          <div className="flex justify-start items-center gap-2">
            <div className="relative flex justify-center items-center">
              <img
                src={TokenImages[token.asset as keyof typeof TokenImages]}
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
              ${token.amount.toFixed(2)}
            </p>
            <p className="text-xs text-secondary font-semibold text-right">
              -$
              {getAmountDeducted(amountDue!, selectedTokens, token).toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
