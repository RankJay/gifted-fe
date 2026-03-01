"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { useSendParams } from "@/hooks/use-send-params";
import { getGiftCardById } from "@/lib/api/gift-card";
import { AmountHeader } from "@/components/send/amount-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthToken } from "@/components/providers/auth-token-context";

export default function SuccessPage() {
  const { token } = useAuthToken();
  const [params] = useSendParams();
  const { giftCardId } = params;

  const [copied, setCopied] = useState(false);

  const { data: giftCard, isLoading } = useQuery({
    queryKey: ["gift-card-success", giftCardId],
    queryFn: () => getGiftCardById(giftCardId!, token!),
    enabled: !!giftCardId && !!token,
    staleTime: Infinity,
    retry: 2,
  });

  const amount = giftCard?.amount ?? "";
  const message = giftCard?.personalMessage ?? "";
  const claimLink = giftCard?.claimLink ?? null;

  const displayLink =
    claimLink && claimLink.length > 36 ? `${claimLink.slice(0, 34)}...` : (claimLink ?? "");

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col min-h-[calc(100dvh-4rem)]"
    >
      {isLoading ? (
        <div className="flex flex-col items-center gap-2 pt-12 pb-8">
          <Skeleton className="h-20 w-48 rounded-xl" />
          <Skeleton className="h-5 w-56 rounded-lg" />
        </div>
      ) : (
        <AmountHeader amount={amount} message={message} />
      )}

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <>
            <Skeleton className="w-full h-14 rounded-2xl" />
            <Skeleton className="w-full h-14 rounded-2xl" />
          </>
        ) : (
          <>
            {claimLink && (
              <div className="w-full rounded-2xl bg-background border border-border px-4 py-3">
                <p className="text-sm font-mono text-foreground break-all">{displayLink}</p>
              </div>
            )}

            <button
              onClick={handleCopy}
              disabled={!claimLink}
              className="w-full h-14 rounded-2xl bg-foreground text-background text-base font-medium flex items-center justify-center gap-2 hover:bg-foreground/90 disabled:opacity-40 transition-colors"
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

            <p className="text-center text-xs text-neutral-500 font-medium tracking-tight leading-relaxed">
              We have successfully confirmed your transaction with Coinbase. Please share this link
              privately
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}
