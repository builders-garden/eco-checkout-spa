import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn-ui/dialog";
import { ChainExplorerStringUrls, ChainImages } from "@/lib/enums";
import { IntentData } from "@/lib/relayoor/types";
import { PaginationState } from "@/lib/types";
import {
  capitalizeFirstLetter,
  chainIdToChain,
  getDateFromRelayoorTimestamp,
  getHumanReadableAmount,
  getPaginationVariants,
  getTimeFromRelayoorTimestamp,
  getTokenSymbolFromAddress,
  truncateAddress,
} from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { CustomButton } from "../customButton";
import { toast } from "sonner";

interface SingleIntentCardProps {
  intent: IntentData;
  index: number;
  paginationState: PaginationState;
}

export const SingleIntentCard = ({
  intent,
  index,
  paginationState,
}: SingleIntentCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // States for copying the transaction hash
  const [isCopyingTransactionHash, setIsCopyingTransactionHash] =
    useState(false);
  const [hasCopiedTransactionHash, setHasCopiedTransactionHash] =
    useState(false);

  // States for copying the intent identifier
  const [isCopyingIntentIdentifier, setIsCopyingIntentIdentifier] =
    useState(false);
  const [hasCopiedIntentIdentifier, setHasCopiedIntentIdentifier] =
    useState(false);

  // States for copying the recipient address
  const [isCopyingRecipientAddress, setIsCopyingRecipientAddress] =
    useState(false);
  const [hasCopiedRecipientAddress, setHasCopiedRecipientAddress] =
    useState(false);

  // Pagination Variants
  const variants = getPaginationVariants();

  // Get the source chain id and destination chain id
  const sourceChainId = Number(intent.params.source);
  const destinationChainId = Number(intent.params.destination);

  // Get the source and destination chains
  const [sourceChain, destinationChain] = useMemo(() => {
    const sourceChainName = chainIdToChain(
      sourceChainId,
      true
    ) as keyof typeof ChainImages;
    const destinationChainName = chainIdToChain(
      destinationChainId,
      true
    ) as keyof typeof ChainImages;
    return [
      {
        chainId: sourceChainId,
        chainName: sourceChainName,
        chainImage: ChainImages[sourceChainName],
      },
      {
        chainId: destinationChainId,
        chainName: destinationChainName,
        chainImage: ChainImages[destinationChainName],
      },
    ];
  }, [intent]);

  // Calculate the date and exact time of the intent
  const [date, time] = useMemo(() => {
    return [
      getDateFromRelayoorTimestamp(intent.createdAt),
      getTimeFromRelayoorTimestamp(intent.createdAt),
    ];
  }, [intent]);

  // Get the source token symbol
  const sourceTokenSymbol = useMemo(() => {
    return getTokenSymbolFromAddress(
      sourceChainId,
      intent.params.rewardTokens[0].token
    );
  }, [intent]);

  // Get the explorer url
  const explorerUrl = useMemo(() => {
    return `${
      ChainExplorerStringUrls[
        sourceChain.chainName as keyof typeof ChainExplorerStringUrls
      ]
    }/tx/${intent.transactionHash}`;
  }, [intent]);

  // Calculate the network fee
  const networkFee = useMemo(() => {
    const rewardTokensAmount = intent.params.rewardTokens.reduce(
      (acc, token) => {
        return acc + Number(token.amount);
      },
      0
    );
    const routeTokensAmount = intent.params.routeTokens.reduce((acc, token) => {
      return acc + Number(token.amount);
    }, 0);

    return rewardTokensAmount - routeTokensAmount;
  }, [intent]);

  // Calculate the recipient address
  const recipientAddress = useMemo(() => {
    return intent.v2GaslessIntentData.permitData.permit3.allowanceOrTransfers.find(
      (transfer) => transfer.chainID === destinationChainId
    )?.account;
  }, [intent]);

  // Handle copying the transaction hash
  const handleCopyTransactionHash = () => {
    if (intent.transactionHash === "undefined") return;
    navigator.clipboard.writeText(intent.transactionHash);
    setIsCopyingTransactionHash(true);
    setTimeout(() => {
      setIsCopyingTransactionHash(false);
      setHasCopiedTransactionHash(true);
      toast.success("Transaction hash copied to clipboard");
      setTimeout(() => {
        setHasCopiedTransactionHash(false);
      }, 2000);
    }, 1500);
  };

  // Handle copying the intent identifier
  const handleCopyIntentIdentifier = () => {
    navigator.clipboard.writeText(intent.hash);
    setIsCopyingIntentIdentifier(true);
    setTimeout(() => {
      setIsCopyingIntentIdentifier(false);
      setHasCopiedIntentIdentifier(true);
      toast.success("Intent identifier copied to clipboard");
      setTimeout(() => {
        setHasCopiedIntentIdentifier(false);
      }, 2000);
    }, 1500);
  };

  // Handle copying the recipient address
  const handleCopyRecipientAddress = () => {
    if (!recipientAddress) return;
    navigator.clipboard.writeText(recipientAddress);
    setIsCopyingRecipientAddress(true);
    setTimeout(() => {
      setIsCopyingRecipientAddress(false);
      setHasCopiedRecipientAddress(true);
      toast.success("Recipient address copied to clipboard");
      setTimeout(() => {
        setHasCopiedRecipientAddress(false);
      }, 2000);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div
          key={`${paginationState.currentPage}-${index}`}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          custom={paginationState}
          transition={{ duration: 0.2, delay: index * 0.075 }}
          className="flex items-center justify-between w-full p-4 border border-border rounded-[8px] bg-card hover:bg-accent/50 transition-colors cursor-pointer"
        >
          {/* Left side - Amount and destination */}
          <div className="flex sm:flex-row flex-col justify-between items-center sm:gap-5 gap-1">
            <div className="flex justify-start w-full items-center gap-2">
              <img
                src={sourceChain.chainImage}
                alt={sourceChain.chainName}
                className="sm:size-9 size-7 rounded-full"
              />
              <ArrowRight className="size-4.5 opacity-70 text-muted-foreground" />
              <img
                src={destinationChain.chainImage}
                alt={destinationChain.chainName}
                className="sm:size-9 size-7 rounded-full"
              />
            </div>

            <div className="flex flex-col gap-1">
              <p className="sm:text-xl text-lg leading-tight font-bold text-foreground">
                {getHumanReadableAmount(
                  intent.params.rewardTokens.reduce((acc, token) => {
                    return acc + Number(token.amount);
                  }, 0),
                  6
                )}{" "}
                {sourceTokenSymbol}
              </p>
              <div className="sm:flex hidden justify-center items-center gap-1.5">
                <p className="text-sm text-muted-foreground">
                  {capitalizeFirstLetter(sourceChain.chainName)}
                </p>
                <ArrowRight className="size-4 opacity-70 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {capitalizeFirstLetter(destinationChain.chainName)}
                </p>{" "}
              </div>
            </div>
          </div>

          {/* Right side - Date, hash, and status */}
          <div className="flex sm:flex-row flex-col justify-between sm:items-center items-end sm:gap-6 gap-1">
            <div className="flex flex-col justify-center items-start gap-1">
              {date && time && (
                <div className="text-foreground font-medium">
                  {date} • {time}
                </div>
              )}
              <div className="sm:flex hidden items-center justify-end">
                {intent.transactionHash !== "undefined" ? (
                  <div className="flex items-center gap-1">
                    <p className="text-sm text-muted-foreground">
                      {truncateAddress(intent.transactionHash, 4)}
                    </p>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No transaction hash
                  </p>
                )}
              </div>
            </div>

            <div
              className={`flex justify-center items-center gap-2 rounded-full border px-2.5 py-0.5 ${
                intent.transactionHash !== "undefined"
                  ? "bg-success/80 border-success/10"
                  : "bg-destructive/80 border-destructive/10"
              }`}
            >
              <p className="text-sm text-white font-semibold">
                {intent.transactionHash === "undefined"
                  ? "Failed"
                  : "Completed"}
              </p>
            </div>
          </div>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="flex flex-col rounded-none sm:rounded-lg pb-20 sm:pb-6 sm:gap-5 gap-6 sm:max-w-[650px] sm:h-fit max-w-full h-full">
        <DialogHeader>
          <DialogTitle className="text-start text-xl font-bold mb-1">
            Transaction Details
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-5 overflow-y-auto">
          {/* Chains and amount */}
          <div className="flex justify-center items-center bg-accent p-4 rounded-lg">
            <div className="flex justify-center items-center sm:gap-6 gap-5">
              <div className="flex flex-col justify-center items-center gap-1">
                <img
                  src={sourceChain.chainImage}
                  alt={sourceChain.chainName}
                  className="sm:size-9 size-8 rounded-full"
                />
                <p className="text-sm font-medium">
                  {capitalizeFirstLetter(sourceChain.chainName)}
                </p>
              </div>
              <div className="flex flex-col justify-center items-center gap-1">
                <ArrowRight className="sm:size-6 size-5 opacity-70 text-muted-foreground" />
                <p className="sm:text-xl text-lg font-bold text-foreground">
                  {getHumanReadableAmount(
                    intent.params.rewardTokens.reduce((acc, token) => {
                      return acc + Number(token.amount);
                    }, 0),
                    6
                  )}{" "}
                  {sourceTokenSymbol}
                </p>
              </div>
              <div className="flex flex-col justify-center items-center gap-1">
                <img
                  src={destinationChain.chainImage}
                  alt={destinationChain.chainName}
                  className="sm:size-9 size-8 rounded-full"
                />
                <p className="text-sm font-medium">
                  {capitalizeFirstLetter(destinationChain.chainName)}
                </p>
              </div>
            </div>
          </div>

          {/* Info section */}
          <div className="flex flex-col sm:flex-row justify-between gap-10 sm:gap-0 items-start">
            {/* Transaction info */}
            <div className="flex flex-col gap-3 w-full">
              <h1 className="text-xl font-bold mb-1">Transaction Info</h1>

              <div className="flex sm:flex-col sm:justify-start justify-between flex-row gap-3 w-full">
                {/* Type */}
                <div className="flex flex-col gap-0.5">
                  <label className="text-sm font-medium text-muted-foreground">
                    Type
                  </label>
                  <p className="text-[17px] font-bold">
                    {intent.intentExecutionType}
                  </p>
                </div>

                {/* Status */}
                <div className="flex flex-col gap-0.5 sm:w-fit w-[30%]">
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div
                    className={`flex w-auto justify-center items-center gap-2 rounded-full border px-2.5 py-0.5 ${
                      intent.transactionHash !== "undefined"
                        ? "bg-success/80 border-success/10"
                        : "bg-destructive/80 border-destructive/10"
                    }`}
                  >
                    <p className="text-sm text-white font-semibold">
                      {intent.transactionHash === "undefined"
                        ? "Failed"
                        : "Completed"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col sm:justify-start justify-between flex-row gap-3 w-full">
                {/* Date and time */}
                <div className="flex flex-col gap-0.5">
                  <label className="text-sm font-medium text-muted-foreground">
                    Date & time
                  </label>
                  <p className="text-[17px] font-bold">
                    {date} at {time}
                  </p>
                </div>

                {/* Network fee */}
                <div className="flex flex-col gap-0.5 sm:w-fit w-[30%]">
                  <label className="text-sm font-medium text-muted-foreground">
                    Network fee
                  </label>
                  <p className="text-[17px] font-bold">
                    {getHumanReadableAmount(networkFee, 6)} {sourceTokenSymbol}
                  </p>
                </div>
              </div>
            </div>

            {/* Technical info */}
            <div className="flex flex-col items-start gap-3 w-full">
              <h1 className="text-xl font-bold mb-1">Technical Info</h1>

              {/* Transaction hash */}
              <div className="flex flex-col gap-0.5">
                <label className="text-sm font-medium text-muted-foreground">
                  Transaction hash
                </label>
                <div className="flex items-center gap-3">
                  <p className="text-[17px] font-bold">
                    {intent.transactionHash !== "undefined"
                      ? truncateAddress(intent.transactionHash, 7)
                      : "No transaction hash"}
                  </p>
                  {intent.transactionHash !== "undefined" && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center justify-center cursor-pointer"
                      onClick={handleCopyTransactionHash}
                    >
                      {isCopyingTransactionHash ? (
                        <Loader2 className="size-4 text-muted-foreground animate-spin" />
                      ) : hasCopiedTransactionHash ? (
                        <Check className="size-4.5 text-muted-foreground" />
                      ) : (
                        <Copy className="size-4 text-muted-foreground" />
                      )}
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Intent Identifier */}
              <div className="flex flex-col gap-0.5">
                <label className="text-sm font-medium text-muted-foreground">
                  Intent Identifier
                </label>
                <div className="flex items-center gap-3">
                  <p className="text-[17px] font-bold">
                    {truncateAddress(intent.hash, 7)}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center justify-center cursor-pointer"
                    onClick={handleCopyIntentIdentifier}
                  >
                    {isCopyingIntentIdentifier ? (
                      <Loader2 className="size-4 text-muted-foreground animate-spin" />
                    ) : hasCopiedIntentIdentifier ? (
                      <Check className="size-4.5 text-muted-foreground" />
                    ) : (
                      <Copy className="size-4 text-muted-foreground" />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Recipient address */}
              <div className="flex flex-col gap-0.5">
                <label className="text-sm font-medium text-muted-foreground">
                  Recipient address
                </label>
                <div className="flex items-center gap-3">
                  <p className="text-[17px] font-bold">
                    {recipientAddress
                      ? truncateAddress(recipientAddress, 7)
                      : "No recipient address"}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center justify-center cursor-pointer"
                    onClick={handleCopyRecipientAddress}
                  >
                    {isCopyingRecipientAddress ? (
                      <Loader2 className="size-4 text-muted-foreground animate-spin" />
                    ) : hasCopiedRecipientAddress ? (
                      <Check className="size-4.5 text-muted-foreground" />
                    ) : (
                      <Copy className="size-4 text-muted-foreground" />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:relative bg-white flex flex-row absolute bottom-0 left-0 right-0 mx-3 sm:mx-0 items-center justify-between sm:justify-between py-3 sm:pt-4 sm:pb-0 border-t border-border">
          <CustomButton
            onClick={() => {
              window.open(explorerUrl, "_blank");
            }}
            className="w-auto relative bottom-0"
            buttonClassName="h-[44px] px-3.5 w-auto border-secondary"
            outline
            whileHover={false}
            whileTap={false}
            isDisabled={intent.transactionHash === "undefined"}
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="size-4" />
              <p className="text-sm font-medium">View on explorer</p>
            </div>
          </CustomButton>
          <CustomButton
            onClick={() => {
              setIsOpen(false);
            }}
            text="Close"
            className="w-auto relative bottom-0"
            buttonClassName="h-[44px] w-auto text-base"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
