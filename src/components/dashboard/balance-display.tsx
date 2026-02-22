"use client";

import { AnimatePresence, motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";

interface BalanceDisplayProps {
  balance: string;
  isLoading: boolean;
}

export function BalanceDisplay({ balance, isLoading }: BalanceDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-1 pt-8 pb-6">
      <p className="text-sm text-neutral-400 font-medium">Current balance</p>
      <div className="flex relative items-baseline gap-2 mt-1">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Skeleton className="h-9 w-48 rounded-lg" />
            </motion.div>
          ) : (
            <>
              <span className="absolute -left-6 bottom-0.5 text-xl text-neutral-400 font-medium">
                $
              </span>
              <motion.span
                key="balance"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-4xl font-semibold tracking-tighter text-foreground leading-none"
              >
                {Number(balance).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </motion.span>
            </>
          )}
        </AnimatePresence>
      </div>
      {/* Placeholder for future gain/loss display */}
      <div className="h-5" />
    </div>
  );
}
