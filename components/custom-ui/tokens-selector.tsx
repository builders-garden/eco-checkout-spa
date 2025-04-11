import { DialogFooter, DialogTrigger } from "../shadcn-ui/dialog";
import { DialogDescription } from "../shadcn-ui/dialog";
import { DialogTitle } from "../shadcn-ui/dialog";
import { DialogHeader } from "../shadcn-ui/dialog";
import { DialogContent } from "../shadcn-ui/dialog";
import { Dialog } from "../shadcn-ui/dialog";
import { Button } from "../shadcn-ui/button";
import { useMemo, useState } from "react";
import { ChevronDownIcon, CircleCheck } from "lucide-react";
import { ChainImages } from "@/lib/enums";
import { SelectableToken } from "./selectable-token";
import { UserAsset } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollArea } from "../shadcn-ui/scroll-area";
import { SuccessCircle } from "./success-circle";

interface TokensSelectorProps {
  userAssets: UserAsset[] | undefined;
  amountDue: number;
  selectedTokens: UserAsset[];
  setSelectedTokens: (
    tokens: UserAsset[] | ((prev: UserAsset[]) => UserAsset[])
  ) => void;
  selectedTotal: number;
  visible?: boolean;
}

export const TokensSelector = ({
  userAssets,
  amountDue,
  selectedTokens,
  setSelectedTokens,
  selectedTotal,
  visible,
}: TokensSelectorProps) => {
  const [open, setOpen] = useState(false);

  const groupSelectedTokensByAssetName: {
    [key: string]: UserAsset[];
  } = useMemo(() => {
    return selectedTokens.reduce((acc, token) => {
      acc[token.asset] = acc[token.asset] || [];
      acc[token.asset].push(token);
      return acc;
    }, {} as Record<string, UserAsset[]>);
  }, [selectedTokens]);

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "86px" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col w-full justify-start items-start gap-1"
        >
          <h1 className="text-[16px] font-semibold">Select Token</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="flex justify-start items-center w-full p-4 border-secondary-foreground border rounded-[10px] cursor-pointer">
                <div className="flex justify-between items-center size-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={
                        selectedTokens.length > 0 ? "selected" : "not-selected"
                      }
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="flex w-full justify-start items-center gap-2"
                    >
                      {Object.entries(groupSelectedTokensByAssetName).map(
                        ([asset, tokens], index) => (
                          <div
                            key={`${asset}`}
                            className="flex justify-center items-center gap-2"
                          >
                            <p className="font-medium">
                              {tokens
                                .reduce((acc, token) => {
                                  return acc + token.amount;
                                }, 0)
                                .toString()
                                .slice(0, 4)}
                            </p>
                            <p className="font-medium">{asset.toUpperCase()}</p>
                            <div className="flex justify-center items-center -space-x-2">
                              {tokens.map((token) => (
                                <motion.img
                                  key={`${token.chain}-${token.asset}`}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.1 }}
                                  className="rounded-full object-cover"
                                  src={ChainImages[token.chain]}
                                  alt={`${token.chain} logo`}
                                  width={20}
                                  height={20}
                                  layout
                                />
                              ))}
                            </div>
                            {index !==
                              Object.entries(groupSelectedTokensByAssetName)
                                .length -
                                1 && (
                              <p className="text-secondary text-[16px]">+</p>
                            )}
                          </div>
                        )
                      )}
                    </motion.div>
                    <SuccessCircle
                      currentAmount={selectedTotal}
                      goalAmount={amountDue}
                      className="mr-1"
                    />
                  </AnimatePresence>
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
              <ScrollArea className="h-[232px] w-full">
                <div className="flex flex-col gap-2 justify-start items-start w-[98%]">
                  {userAssets && userAssets.length > 0 ? (
                    userAssets.map((token) => (
                      <SelectableToken
                        key={`${token.asset}-${token.chain}`}
                        token={token}
                        selectedTokens={selectedTokens}
                        setSelectedTokens={setSelectedTokens}
                        selectedTotal={selectedTotal}
                        amountDue={amountDue}
                      />
                    ))
                  ) : (
                    <p className="text-lg font-medium w-full my-7 text-center text-secondary">
                      No tokens found
                      <br />
                      Try connecting to a different wallet
                    </p>
                  )}
                </div>
              </ScrollArea>
              <DialogFooter className="flex justify-between items-center w-full">
                <div className="flex justify-start items-center w-full gap-2">
                  <p>Selected total:</p>
                  <span className="font-bold text-primary">
                    $
                    {selectedTotal > amountDue
                      ? amountDue.toFixed(2)
                      : selectedTotal?.toString().slice(0, 4)}{" "}
                    / ${amountDue.toFixed(2)}
                  </span>
                  <SuccessCircle
                    currentAmount={selectedTotal}
                    goalAmount={amountDue}
                  />
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};
