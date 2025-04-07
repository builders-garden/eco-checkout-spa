import { formatTokenAmountByChain } from "@/lib/utils";
import { TokenBalance, Chain } from "@/lib/relayoor/types";
import { TokenDecimals, TokenImages, ChainImages } from "@/lib/enums";
import { useState } from "react";
import { cn } from "@/lib/shadcn/utils";

interface SelectableTokenProps {
  token: TokenBalance;
  chain: Chain;
  handleSelectToken: (token: TokenBalance) => void;
}

export const SelectableToken = ({
  token,
  chain,
  handleSelectToken,
}: SelectableTokenProps) => {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <button
      key={`${token.token}-${chain}`}
      onClick={() => {
        setIsSelected(!isSelected);
        handleSelectToken(token);
      }}
      className={cn(
        "flex justify-between items-center w-full bg-secondary-foreground rounded-[10px] p-2.5 cursor-pointer transition-all duration-300",
        !isSelected && "opacity-50"
      )}
    >
      <p>
        {formatTokenAmountByChain(token)} {token.token.toUpperCase()} on{" "}
        {chain.slice(0, 1).toUpperCase() + chain.slice(1)}
      </p>

      <div className="relative flex justify-center items-center gap-1">
        <img
          src={TokenImages[token.token as keyof typeof TokenImages]}
          alt={token.token}
          width={32}
          height={32}
          className="rounded-full object-cover"
        />
        <img
          src={ChainImages[chain as keyof typeof ChainImages]}
          alt={chain}
          width={12}
          height={12}
          className="absolute bottom-0 right-0 rounded-full object-cover"
        />
      </div>
    </button>
  );
};
