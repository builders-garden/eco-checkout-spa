import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { PaymentPageState } from "@/lib/enums";
import { motion } from "framer-motion";
import { TxContainerHeader } from "./tx-container-header";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import ky from "ky";
import { Permit3SignatureData } from "@/lib/relayoor/types";
import { signTypedData, switchChain } from "@wagmi/core";
import { config } from "@/lib/appkit";
import { PERMIT3_TYPES } from "@/lib/constants";
import { Address } from "viem";
import { toast } from "sonner";

interface TransactionsContainerProps {
  setPaymentPageState: (paymentPageState: PaymentPageState) => void;
}

export default function TransactionsContainer({
  setPaymentPageState,
}: TransactionsContainerProps) {
  const { address } = useAppKitAccount();
  const { paymentParams, desiredNetworkString, amountDueRaw } =
    usePaymentParams();
  const { recipient, desiredToken, amountDue } = paymentParams;

  const [requestID, setRequestID] = useState<string>();
  const [signatureData, setSignatureData] = useState<Permit3SignatureData>();
  const [userSignedMessage, setUserSignedMessage] = useState<string>();

  useEffect(() => {
    const getRequestIDAndSignatureData = async () => {
      if (
        address &&
        desiredNetworkString &&
        desiredToken &&
        amountDueRaw &&
        recipient
      ) {
        try {
          const response = await ky
            .post<{
              signatureData: Permit3SignatureData;
              requestID: string;
            }>(
              `/api/get-intents?sender=${address}&recipient=${recipient}&destinationNetwork=${desiredNetworkString}&destinationToken=${desiredToken}&transferAmount=${amountDueRaw}`,
              {
                timeout: false,
              }
            )
            .json();

          setSignatureData(response.signatureData);
          setRequestID(response.requestID);
        } catch (error) {
          toast.error("Failed to get intents");
          console.error(error);
        }
      }
    };

    getRequestIDAndSignatureData();
  }, [address]);

  useEffect(() => {
    const signMessageWithPermit3 = async () => {
      if (signatureData && requestID) {
        await switchChain(config, {
          chainId: 1,
        });

        const result = await signTypedData(config, {
          domain: {
            name: signatureData.domain.name,
            version: signatureData.domain.version,
            chainId: signatureData.domain.chainId,
            verifyingContract: signatureData.domain
              .verifyingContract as Address,
          },
          types: PERMIT3_TYPES,
          primaryType: "SignedUnhingedPermit3",
          message: signatureData.message,
        });

        setUserSignedMessage(result);
      }
    };

    signMessageWithPermit3();
  }, [signatureData]);

  useEffect(() => {
    const executeIntent = async () => {
      if (requestID && userSignedMessage) {
        console.log("Executing intent", requestID, userSignedMessage);
        try {
          const response = await ky
            .post(`/api/execute-intent`, {
              json: { requestID, userSignedMessage },
              timeout: false,
            })
            .json();

          console.log("Intent executed", response);
        } catch (error) {
          console.error(error);
          toast.error("Failed to execute intent");
        }
      }
    };

    executeIntent();
  }, [requestID, userSignedMessage]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-start size-full min-h-screen sm:min-h-0 sm:max-w-[496px] p-4.5 sm:p-5 gap-4 sm:border sm:border-secondary-foreground sm:rounded-[8px] overflow-hidden bg-background"
    >
      {/* Header */}
      <TxContainerHeader amountDue={amountDue!} />
    </motion.div>
  );
}
