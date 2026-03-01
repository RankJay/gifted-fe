"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useSendParams } from "@/hooks/use-send-params";
import { useGiftCardPolling } from "@/hooks/use-gift-card-polling";
import { Spinner } from "@/components/ui/spinner";

export default function ProcessingPage() {
  const router = useRouter();
  const [params] = useSendParams();
  const { giftCardId } = params;

  const { data: giftCard } = useGiftCardPolling({ giftCardId });

  useEffect(() => {
    if (!giftCard) return;

    if (giftCard.status === "active") {
      router.replace(`/dashboard/send/success?giftCardId=${giftCard.id}`);
    } else if (giftCard.status === "payment_failed") {
      toast.error("Payment failed. Please try again.");
      router.replace("/dashboard");
    }
  }, [giftCard, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-4rem)]">
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "linear" }}
        >
          <Spinner className="size-5 text-emerald-500" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-base font-medium text-emerald-500 tracking-normal"
        >
          processing
        </motion.p>
      </div>
    </div>
  );
}
