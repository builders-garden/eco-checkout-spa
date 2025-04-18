"use client";

import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useMemo, useState, useCallback, useEffect } from "react";
import { Input } from "../../shadcn-ui/input";
import {
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../../shadcn-ui/select";
import { SelectItem } from "../../shadcn-ui/select";
import { Select } from "../../shadcn-ui/select";
import { Separator } from "../../shadcn-ui/separator";
import { useQueryState } from "nuqs";
import { PaymentParamsValidator } from "@/lib/classes/PaymentParamsValidator";
import { chainIdToChainName } from "@/lib/utils";
import { ChainImages } from "@/lib/enums";
import { PageState } from "@/lib/enums";
import { usePaymentParams } from "../../providers/payment-params-provider";
import { ChainSelection } from "./chain-selection";
import { useDebounce } from "@/hooks/use-debounce";

interface MissingParamsContainerProps {
  setPageState: (pageState: PageState) => void;
}

export const MissingParamsContainer = ({
  setPageState,
}: MissingParamsContainerProps) => {
  const { paymentParams } = usePaymentParams();

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

  // Check if all required fields are filled and valid
  const validateForm = useCallback(() => {
    return Boolean(
      PaymentParamsValidator.validateRecipient(userInputRecipient) &&
        PaymentParamsValidator.validateAmount(userInputAmount) &&
        PaymentParamsValidator.validateNetwork(userInputNetwork)
    );
  }, [userInputRecipient, userInputAmount, userInputNetwork]);

  const isFormComplete = useDebounce(validateForm(), 250);

  // Handle form submission
  const handleContinue = () => {
    if (isFormComplete) {
      setRecipient(userInputRecipient);
      setNetwork(userInputNetwork);
      setAmount(userInputAmount);
      setPageState(PageState.CHECKOUT);
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
      className="flex flex-col w-full sm:max-w-[496px] p-4 sm:p-5 gap-4 border border-secondary-foreground rounded-[8px] overflow-hidden bg-background"
    >
      <h2 className="text-2xl font-bold my-2">Payment Summary</h2>

      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <p className="text-secondary">Recipient</p>
          {!paymentParams.recipient ? (
            <Input
              id="recipient"
              placeholder="0x..."
              value={userInputRecipient}
              onChange={(e) => setUserInputRecipient(e.target.value)}
              className="h-[48px]"
            />
          ) : (
            <div className="flex items-center text-primary border border-secondary-foreground rounded-md px-3 h-[48px]">
              {paymentParams.recipient}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-secondary">Chain</p>
          {!paymentParams.desiredNetworkId ? (
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
            {!paymentParams.amountDue ? (
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
                    // Only allow numbers and decimals
                    const value = e.target.value.replace(/[^0-9.]/g, "");
                    setUserInputAmount(value);
                  }}
                  className="pl-8 h-[48px] text-right text-primary font-semibold"
                />
              </div>
            ) : (
              <p className="text-primary font-semibold">
                $ {paymentParams.amountDue.toFixed(2)}
              </p>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!isFormComplete && (
              <motion.div
                key="blue-warning"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "96px" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-end w-full overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4 rounded-md bg-blue-50 border border-blue-700 text-blue-700 h-[72px]">
                  <AlertCircle className="size-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    Please fill out all required fields to continue with the
                    payment
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: !isFormComplete ? 1 : 1.02 }}
          whileTap={{ scale: !isFormComplete ? 1 : 0.98 }}
          onClick={handleContinue}
          className={`flex justify-center items-center w-full bg-primary text-white font-semibold rounded-[8px] p-4 h-[60px] transition-all duration-300 ${
            !isFormComplete ? "opacity-70 cursor-default" : "cursor-pointer"
          }`}
          type="button"
          disabled={!isFormComplete}
          style={{
            zIndex: 50,
          }}
        >
          {isFormComplete ? "Continue" : "Complete required fields"}
        </motion.button>
      </div>
    </motion.div>
  );
};
