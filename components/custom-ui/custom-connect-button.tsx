import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useState } from "react";

interface CustomConnectButtonProps {
  isLoading: boolean;
}

export const CustomConnectButton = ({
  isLoading,
}: CustomConnectButtonProps) => {
  const [mounted, setMounted] = useState(false);
  const { isConnected, status, address } = useAppKitAccount();
  const { open } = useAppKit();

  useEffect(() => {
    setMounted(true);
  }, []);

  const ready = status !== "connecting" && status !== "reconnecting";
  const connected = isConnected && !!address;

  const isDisabled = !mounted || isLoading || !ready;

  const getButtonProps = () => {
    if (!connected) {
      return {
        text: "Connect",
        onClick: () => open({ view: "Connect" }),
        key: "connect",
      };
    }
    return {
      text: "Confirm & Send",
      onClick: () => {},
      key: "confirm",
    };
  };

  const { text, onClick, key } = getButtonProps();

  return (
    <motion.button
      initial={{ opacity: 1 }}
      animate={{ opacity: isDisabled ? 0.7 : 1 }}
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="flex justify-center items-center w-full bg-primary rounded-[10px] p-4 h-[60px] cursor-pointer"
      type="button"
      disabled={isDisabled}
    >
      <AnimatePresence mode="wait">
        <p key={key} className="text-xl text-white font-bold">
          {isDisabled ? <Loader2 className="size-6 animate-spin" /> : text}
        </p>
      </AnimatePresence>
    </motion.button>
  );
};
