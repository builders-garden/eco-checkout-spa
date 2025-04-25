import { cn } from "@/lib/shadcn/utils";

interface ThreeDecimalsAmountProps {
  amount: number;
  className?: string;
}

export const ThreeDecimalsAmount = ({
  amount,
  className,
}: ThreeDecimalsAmountProps) => {
  const amountStr = amount.toString();
  const [whole, decimals] = amountStr.split(".");
  const firstTwoDecimals = decimals ? decimals.slice(0, 2) : "00";
  const thirdDecimal = decimals ? decimals[2] || "0" : "0";

  return (
    <p className={cn("text-[16px] font-semibold", className)}>
      ${whole}.{firstTwoDecimals}
      <span className="text-[12px]">{thirdDecimal}</span>
    </p>
  );
};
