import { TokenImages, ChainImages } from "@/lib/enums";
import { useState } from "react";
import { cn } from "@/lib/shadcn/utils";
import { UserAsset } from "@/lib/types";
import { formatTokenAmount } from "@/lib/utils";

interface SelectableTokenProps {
  token: UserAsset;
  handleSelectToken: (token: UserAsset) => void;
}

export const SelectableToken = ({
  token,
  handleSelectToken,
}: SelectableTokenProps) => {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <button
      key={`${token.asset}-${token.chain}`}
      onClick={() => {
        setIsSelected(!isSelected);
        handleSelectToken(token);
      }}
      className={cn(
        "flex justify-between items-center w-full bg-secondary-foreground rounded-[10px] p-2.5 cursor-pointer transition-all duration-200",
        !isSelected && "opacity-50"
      )}
    >
      <p>
        {formatTokenAmount(token)} {token.asset.toUpperCase()} on{" "}
        {token.chain.slice(0, 1).toUpperCase() + token.chain.slice(1)}
      </p>

      <div className="relative flex justify-center items-center gap-1">
        <img
          src={TokenImages[token.asset]}
          alt={token.asset}
          width={32}
          height={32}
          className="rounded-full object-cover"
        />
        <img
          src={ChainImages[token.chain]}
          alt={token.chain}
          width={12}
          height={12}
          className="absolute bottom-0 right-0 rounded-full object-cover"
        />
      </div>
    </button>
  );
};
