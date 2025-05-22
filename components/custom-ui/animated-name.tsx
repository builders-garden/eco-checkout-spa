"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/shadcn/utils";

interface AnimatedNameProps {
  address: string;
  height?: number;
  name?: string;
  className?: string;
  textClassName?: string;
  isFetchingName?: boolean;
  disabled?: boolean;
}

export default function AnimatedName({
  name,
  address,
  height = 24,
  className,
  textClassName,
  isFetchingName = false,
}: AnimatedNameProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hasName, setHasName] = useState(!isFetchingName && Boolean(name));
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }

    setHasName(Boolean(name));
  }, [name, isInitialMount]);

  return (
    <div
      className={cn(
        "relative flex flex-col justify-center items-end gap-0 h-6 w-[33%] overflow-hidden cursor-default",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="sync">
        {/* Preferred name */}
        {hasName && (
          <motion.p
            key="preferred-name"
            className={cn(
              "absolute top-0 text-[16px] font-semibold",
              textClassName
            )}
            initial={{ y: isInitialMount ? 0 : -height }}
            animate={{
              y: isHovered ? -height : 0,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 25,
              },
            }}
            exit={{ y: -height }}
          >
            {name}
          </motion.p>
        )}

        {/* Address */}
        <motion.p
          key="address"
          className={cn(
            "absolute top-0 text-[16px] font-semibold",
            textClassName
          )}
          initial={{ y: isInitialMount && hasName ? height : 0 }}
          animate={{
            y: hasName && !isHovered ? height : 0,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 25,
            },
          }}
        >
          {address}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
