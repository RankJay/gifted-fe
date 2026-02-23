"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { AmountHeader } from "@/components/send/amount-header";
import { useSendParams } from "@/hooks/use-send-params";
import { Check } from "lucide-react";

export default function SuccessPage() {
  const [params] = useSendParams();
  const { amount, message, claimLink } = params;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!claimLink) return;
    try {
      await navigator.clipboard.writeText(claimLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable in some contexts
    }
  };

  const displayLink =
    claimLink && claimLink.length > 36 ? `${claimLink.slice(0, 34)}...` : (claimLink ?? "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col min-h-[calc(100dvh-4rem)]"
    >
      <AmountHeader amount={amount} message={message} />

      <div className="flex flex-col gap-4">
        {/* Claim link display */}
        {claimLink && (
          <div className="w-full rounded-2xl bg-background border border-border px-4 py-3">
            <p className="text-sm font-mono text-foreground break-all">{displayLink}</p>
          </div>
        )}

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="w-full h-14 rounded-2xl bg-foreground text-background text-base font-medium flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors"
        >
          {copied ? (
            <>
              <Check className="size-4" />
              Copied!
            </>
          ) : (
            "Copy link"
          )}
        </button>

        {/* Confirmation note */}
        <p className="text-center text-xs text-neutral-500 font-medium tracking-tight leading-relaxed">
          We have successfully confirmed your transaction with Coinbase. Please share this link
          privately
        </p>
      </div>
    </motion.div>
  );
}
