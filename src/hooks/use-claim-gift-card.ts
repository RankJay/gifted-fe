"use client"

import { useMutation } from "@tanstack/react-query"
import {
  claimGiftCard,
  type ClaimGiftCardRequest,
  type ClaimGiftCardResponse,
} from "@/lib/api"

/**
 * React Query hook for claiming a gift card
 */
export function useClaimGiftCard() {
  return useMutation<
    ClaimGiftCardResponse,
    Error,
    { claimSecret: string; data: ClaimGiftCardRequest }
  >({
    mutationFn: ({ claimSecret, data }) => claimGiftCard(claimSecret, data),
  })
}
