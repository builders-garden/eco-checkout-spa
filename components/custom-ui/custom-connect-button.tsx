import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";

export const CustomConnectButton = ({
  isConnected,
}: {
  isConnected: boolean;
}) => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated") &&
          isConnected;

        const getButtonProps = () => {
          if (!connected) {
            return {
              text: "Connect",
              onClick: openConnectModal,
              key: "connect",
            };
          }
          if (chain.unsupported) {
            return {
              text: "Wrong network",
              onClick: openChainModal,
              key: "wrong-network",
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
            className="flex justify-center items-center w-full bg-primary rounded-[10px] cursor-pointer"
          >
            <AnimatePresence mode="wait">
              <motion.button
                key={key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                onClick={onClick}
                className="flex justify-center items-center w-full p-4 cursor-pointer text-xl font-bold text-white"
                type="button"
              >
                {text}
              </motion.button>
            </AnimatePresence>
          </motion.div>
        );
      }}
    </ConnectButton.Custom>
  );
};
