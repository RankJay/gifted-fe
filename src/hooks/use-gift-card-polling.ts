"use client";

import { useQuery } from "@tanstack/react-query";
import { getGiftCardById } from "@/lib/api/gift-card";

const TERMINAL_STATUSES = new Set(["active", "claimed", "redeemed", "payment_failed"]);
const MAX_POLL_ATTEMPTS = 30;

interface UseGiftCardPollingOptions {
  giftCardId: string | null;
  userId: string | null;
  walletAddress: string | undefined;
}

export function useGiftCardPolling({
  giftCardId,
  userId,
  walletAddress,
}: UseGiftCardPollingOptions) {
  return useQuery({
    queryKey: ["gift-card-poll", giftCardId],
    queryFn: () => getGiftCardById(giftCardId!, { userId: userId!, walletAddress: walletAddress! }),
    enabled: !!giftCardId && !!userId && !!walletAddress,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2000;
      if (TERMINAL_STATUSES.has(data.status)) return false;
      const attempts = Math.floor((Date.now() - query.state.dataUpdatedAt) / 2000);
      if (attempts >= MAX_POLL_ATTEMPTS) return false;
      return 2000;
    },
    retry: false,
  });
}
