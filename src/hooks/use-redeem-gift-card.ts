"use client";

import { useMutation } from "@tanstack/react-query";
import {
  redeemGiftCard,
  type RedeemGiftCardRequest,
  type RedeemGiftCardResponse,
} from "@/lib/api/gift-card";

/**
 * React Query hook for redeeming a gift card
 */
export function useRedeemGiftCard() {
  return useMutation<
    RedeemGiftCardResponse,
    Error,
    { giftCardId: string; data: RedeemGiftCardRequest }
  >({
    mutationFn: ({ giftCardId, data }) => redeemGiftCard(giftCardId, data),
  });
}
