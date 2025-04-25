import { motion } from "framer-motion";

export const PoweredByCapsule = () => {
  return (
    <motion.button
      whileTap={{
        scale: 0.985,
      }}
      whileHover={{
        scale: 1.015,
      }}
      className="flex justify-start items-center gap-1 text-[11px] px-2 py-0.5 border border-blue-500 rounded-full cursor-pointer"
      onClick={() => {
        window.open("https://eco.com/", "_blank");
      }}
    >
      <p>Powered by</p>
      <img
        src="/images/eco-logo.png"
        alt="Capsule Logo"
        className="h-2.5 w-auto"
      />
    </motion.button>
  );
};
