"use client";

import { motion } from "framer-motion";
import { useMemo, useState, useCallback, useEffect } from "react";
import { Input } from "../../shadcn-ui/input";
import { Separator } from "../../shadcn-ui/separator";
import { useQueryState } from "nuqs";
import { PaymentParamsValidator } from "@/lib/classes/PaymentParamsValidator";
import { chainIdToChainName } from "@/lib/utils";
import { ChainImages } from "@/lib/enums";
import { PageState } from "@/lib/enums";
import { usePaymentParams } from "../../providers/payment-params-provider";
import { ChainSelection } from "./chain-selection";
import { useDebouncedCallback } from "@/hooks/use-debounce";
import { PoweredByCapsule } from "../powered-by-capsule";
import { ScrollArea, ScrollBar } from "@/components/shadcn-ui/scroll-area";
import { BlueInfoBox } from "./blue-info-box";
import { getAddressFromEns } from "@/lib/names/ens";
import { isAddress } from "viem";

interface MissingParamsContainerProps {
  setPageState: (pageState: PageState) => void;
}

export const MissingParamsContainer = ({
  setPageState,
}: MissingParamsContainerProps) => {
  const { paymentParams } = usePaymentParams();
  const [isFormValid, setIsFormValid] = useState(false);

  // Payment Query Params
  const setRecipient = useQueryState("recipient")[1];
  const setNetwork = useQueryState("network")[1];
  const setAmount = useQueryState("amount")[1];

  // User input fields
  const [userInputRecipient, setUserInputRecipient] = useState(
    (paymentParams.recipient ?? "") as string
  );
  const [userInputNetwork, setUserInputNetwork] = useState(
    paymentParams.desiredNetworkId
      ? paymentParams.desiredNetworkId.toString()
      : ""
  );
  const [userInputAmount, setUserInputAmount] = useState(
    paymentParams.amountDue ? paymentParams.amountDue.toString() : ""
  );

  // Memoized values to avoid unnecessary re-renders during pageState change
  const hasNetwork = useMemo(() => Boolean(paymentParams.desiredNetworkId), []);
  const hasRecipient = useMemo(() => Boolean(paymentParams.recipient), []);
  const hasAmount = useMemo(() => Boolean(paymentParams.amountDue), []);

  // Check if all required fields are filled and valid
  const validateForm = useCallback(async () => {
    console.log("Validating form");
    const isValid = Boolean(
      (await PaymentParamsValidator.validateRecipient(userInputRecipient)) &&
        PaymentParamsValidator.validateAmount(userInputAmount) &&
        PaymentParamsValidator.validateNetwork(userInputNetwork)
    );
    setIsFormValid(isValid);
  }, [userInputRecipient, userInputAmount, userInputNetwork]);

  const debouncedValidateForm = useDebouncedCallback(validateForm, 400);

  useEffect(() => {
    debouncedValidateForm();
  }, [debouncedValidateForm]);

  // Handle form submission
  const handleContinue = async () => {
    if (isFormValid) {
      const recipientAddress = isAddress(userInputRecipient)
        ? userInputRecipient
        : await getAddressFromEns(userInputRecipient);
      setRecipient(recipientAddress);
      setNetwork(userInputNetwork);
      setAmount(userInputAmount);
      setTimeout(() => {
        setPageState(PageState.CHECKOUT);
      }, 300);
    }
  };

  // Chain Info
  const chainInfo: { name: string; image: string } = useMemo(() => {
    try {
      const chainName = chainIdToChainName(paymentParams.desiredNetworkId!);
      return {
        name: chainName,
        image: ChainImages[chainName as keyof typeof ChainImages],
      };
    } catch (error) {
      return {
        name: "",
        image: "",
      };
    }
  }, [paymentParams.desiredNetworkId]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 0 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-start size-full min-h-screen sm:min-h-0 sm:max-w-[496px] p-4.5 sm:p-5 gap-6 sm:border sm:border-secondary-foreground sm:rounded-[8px] overflow-hidden bg-background"
    >
      <div className="flex justify-between items-center w-full">
        <h1 className="text-[22px] font-bold sm:my-2">Payment Details</h1>
        <PoweredByCapsule />
      </div>
      <div className="space-y-2">
        <p className="text-secondary">Recipient</p>
        {!hasRecipient ? (
          <Input
            id="recipient"
            placeholder="0x..."
            value={userInputRecipient}
            onChange={(e) => setUserInputRecipient(e.target.value)}
            className="h-[48px]"
          />
        ) : (
          <div className="flex items-center text-primary border border-secondary-foreground rounded-md px-3 h-[48px] overflow-hidden">
            <ScrollArea className="w-full">
              <p className="text-primary">{paymentParams.recipient}</p>
              <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-secondary">Chain</p>
        {!hasNetwork ? (
          <ChainSelection
            userInputNetwork={userInputNetwork}
            setUserInputNetwork={setUserInputNetwork}
          />
        ) : (
          <div className="flex items-center gap-1.5 text-primary font-semibold border border-secondary-foreground rounded-md px-3 h-[48px]">
            <img
              src={chainInfo.image}
              alt={chainInfo.name}
              className="size-[18px] rounded-full"
            />
            {chainInfo.name}
          </div>
        )}
      </div>

      <Separator />

      <div className="flex flex-col">
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold">Amount</p>
          {!hasAmount ? (
            <div className="relative w-[35%]">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-primary font-semibold">$</span>
              </div>
              <Input
                id="amount"
                type="text"
                placeholder="0.00"
                value={userInputAmount}
                onChange={(e) => {
                  // Only allow numbers and maximum 2 decimals
                  const value = e.target.value.replace(/[^0-9.]/g, "");
                  const parts = value.split(".");

                  // Prevent numbers starting with 0 unless it's a decimal
                  if (value.startsWith("0") && !value.startsWith("0.")) {
                    setUserInputAmount(value.slice(1));
                    return;
                  }

                  if (parts.length > 1 && parts[1].length > 2) {
                    setUserInputAmount(parts[0] + "." + parts[1].slice(0, 2));
                  } else {
                    setUserInputAmount(value);
                  }
                }}
                className="pl-8 h-[48px] text-right text-primary font-semibold"
              />
            </div>
          ) : (
            <p className="text-primary font-semibold">
              $ {paymentParams.amountDue!.toFixed(2)}
            </p>
          )}
        </div>
        <BlueInfoBox isFormComplete={isFormValid} />
      </div>

      <div className="sticky sm:bottom-0 bottom-6 left-0 right-0 sm:relative sm:p-0 mt-auto">
        <motion.button
          whileHover={{ scale: !isFormValid ? 1 : 1.02 }}
          whileTap={{ scale: !isFormValid ? 1 : 0.98 }}
          onClick={handleContinue}
          className={`flex justify-center items-center w-full bg-primary text-white font-semibold rounded-[8px] p-4 h-[60px] transition-all duration-300 ${
            !isFormValid ? "opacity-70 cursor-default" : "cursor-pointer"
          }`}
          type="button"
          disabled={!isFormValid}
          style={{
            zIndex: 50,
          }}
        >
          {isFormValid ? "Continue" : "Complete required fields"}
        </motion.button>
      </div>
    </motion.div>
  );
};
