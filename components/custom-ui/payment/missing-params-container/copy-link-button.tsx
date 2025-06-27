import { usePaymentParams } from "@/components/providers/payment-params-provider";
import { AnimatePresence, motion } from "framer-motion";
import ky from "ky";
import { Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CopyLinkButtonProps {
  isFormValid: boolean;
  userInputRecipient: string;
  userInputAmount: string;
  userInputNetwork: string;
}

export const CopyLinkButton = ({
  isFormValid,
  userInputRecipient,
  userInputAmount,
  userInputNetwork,
}: CopyLinkButtonProps) => {
  const { paymentParams } = usePaymentParams();

  // Is copying link
  const [isCopyingLink, setIsCopyingLink] = useState(false);

  // Handle copy link
  const handleCopyLink = async () => {
    setIsCopyingLink(true);
    try {
      const paymentParamsToSet = {
        recipient: userInputRecipient,
        amountDue: userInputAmount,
        desiredNetworkId: userInputNetwork,
        desiredToken: paymentParams.desiredToken,
        redirect: paymentParams.redirect,
        showFees: paymentParams.showFees,
      };
      const paymentId = await ky
        .post<string>("/api/redis/set-payment-params", {
          json: { paymentParams: paymentParamsToSet },
        })
        .json();

      setTimeout(() => {
        const paymentUrl = `${window.location.origin}/${paymentId}`;
        navigator.clipboard.writeText(paymentUrl);
        toast.success("Link copied to clipboard");
        setIsCopyingLink(false);
      }, 500);
    } catch (error) {
      console.error("Error copying link", error);
      setTimeout(() => {
        toast.error("Error copying link. Please try again.");
        setIsCopyingLink(false);
      }, 500);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: !isFormValid ? 1 : 1.02 }}
      whileTap={{ scale: !isFormValid ? 1 : 0.98 }}
      onClick={handleCopyLink}
      className={`flex justify-center items-center w-[60px] h-[60px] shrink-0 bg-background border border-black text-black font-semibold rounded-[8px] transition-all duration-300 ${
        !isFormValid ? "opacity-40 cursor-default" : "cursor-pointer"
      }`}
      type="button"
      disabled={!isFormValid}
      style={{
        zIndex: 50,
      }}
    >
      <AnimatePresence mode="wait">
        {isCopyingLink ? (
          <motion.span
            key="copying-link"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 className="size-4 animate-spin" />
          </motion.span>
        ) : (
          <motion.span
            key="copy-link"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1"
          >
            <Copy className="size-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
