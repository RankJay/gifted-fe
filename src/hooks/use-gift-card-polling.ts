"use client";

import { useQuery } from "@tanstack/react-query";
import { getGiftCardById } from "@/lib/api/gift-card";
import { useAuthToken } from "@/components/providers/auth-token-context";

const TERMINAL_STATUSES = new Set(["active", "claimed", "redeemed", "payment_failed"]);
const MAX_POLL_ATTEMPTS = 30;

interface UseGiftCardPollingOptions {
  giftCardId: string | null;
}

export function useGiftCardPolling({ giftCardId }: UseGiftCardPollingOptions) {
  const { token } = useAuthToken();

  return useQuery({
    queryKey: ["gift-card-poll", giftCardId],
    queryFn: () => getGiftCardById(giftCardId!, token!),
    enabled: !!giftCardId && !!token,
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
