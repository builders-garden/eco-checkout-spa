import { DialogFooter, DialogTrigger } from "../shadcn-ui/dialog";
import { DialogDescription } from "../shadcn-ui/dialog";
import { DialogTitle } from "../shadcn-ui/dialog";
import { DialogHeader } from "../shadcn-ui/dialog";
import { DialogContent } from "../shadcn-ui/dialog";
import { Dialog } from "../shadcn-ui/dialog";
import { Button } from "../shadcn-ui/button";
import { useEffect, useState } from "react";
import { TokenBalance, Chain } from "@/lib/relayoor/types";
import { ChevronDownIcon } from "lucide-react";
import { ChainImages, TokenDecimals, TokenImages } from "@/lib/enums";
import { formatTokenAmountByChain } from "@/lib/utils";
import { SelectableToken } from "./selectable-token";

interface TokensSelectorProps {
  tokenBalances: Record<Chain, TokenBalance[]>;
  amountDue: string;
}

export const TokensSelector = ({
  tokenBalances,
  amountDue,
}: TokensSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState<TokenBalance[] | null>(
    null
  );

  const selectedTotal =
    selectedTokens?.reduce((acc, token) => {
      return acc + formatTokenAmountByChain(token);
    }, 0) ?? 0;

  const handleSelectToken = (token: TokenBalance) => {
    setSelectedTokens((prev) => {
      if (prev?.includes(token)) {
        return prev.filter((t) => t !== token);
      }
      return [...(prev ?? []), token];
    });
  };

  useEffect(() => {
    console.log(selectedTokens);
  }, [selectedTokens]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex justify-start items-center w-full p-4 border-secondary-foreground border rounded-[10px] cursor-pointer">
          <div className="flex justify-between items-center size-full">
            <div className="flex w-full justify-start items-center gap-2">
              {selectedTokens?.map((token) => (
                <div
                  key={`${token.token}`}
                  className="flex justify-center items-center -space-x-2"
                >
                  <img
                    className="rounded-full object-cover"
                    src={ChainImages.ethereum}
                    alt="Ethereum Logo"
                    width={20}
                    height={20}
                  />
                  <img
                    className="rounded-full object-cover"
                    src={ChainImages.optimism}
                    alt="Optimism Logo"
                    width={20}
                    height={20}
                  />
                </div>
              ))}
            </div>
            <ChevronDownIcon className="w-4 h-4" />
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-4 justify-start items-start sm:max-w-[487px]">
        <DialogHeader className="flex flex-col gap-1 justify-start items-start">
          <DialogTitle>Select one or more payment method</DialogTitle>
          <DialogDescription>
            Amount due:{" "}
            <span className="font-bold text-primary">${amountDue}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 justify-start items-start w-full">
          {Object.entries(tokenBalances).map(([chain, tokens]) =>
            tokens
              .filter(
                // TODO: Evaluate if we should show all tokens or only USDC and USDT
                (token) => token.token === "usdc" || token.token === "usdt"
              )
              .map((token) => (
                <SelectableToken
                  key={`${token.token}-${chain}`}
                  token={token}
                  chain={chain}
                  handleSelectToken={handleSelectToken}
                />
              ))
          )}
        </div>
        <DialogFooter className="flex justify-between items-center w-full">
          <div className="flex justify-start items-center w-full gap-2">
            <p>Selected total:</p>
            <span className="font-bold text-primary">
              ${selectedTotal} / ${amountDue}
            </span>
          </div>
          <Button
            type="button"
            onClick={() => {
              setOpen(false);
            }}
            className="cursor-pointer"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
