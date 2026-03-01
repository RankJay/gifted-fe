"use client";

import { useMutation } from "@tanstack/react-query";
import { redeemGiftCard, type RedeemGiftCardResponse } from "@/lib/api/gift-card";
import { useAuthToken } from "@/components/providers/auth-token-context";
import { ApiError } from "@/lib/api/client";

/**
 * React Query hook for redeeming a gift card (requires auth token).
 */
export function useRedeemGiftCard() {
  const { token } = useAuthToken();

  return useMutation<RedeemGiftCardResponse, Error, { giftCardId: string }>({
    mutationFn: ({ giftCardId }) => {
      if (!token) throw new ApiError(401, "UNAUTHENTICATED", "Not authenticated");
      return redeemGiftCard(giftCardId, token);
    },
  });
}
