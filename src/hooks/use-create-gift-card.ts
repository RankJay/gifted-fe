"use client"

import { useMutation } from "@tanstack/react-query"
import { createGiftCardMock, type CreateGiftCardRequest, type GiftCardResponse } from "@/lib/api"

/**
 * React Query hook for creating gift cards
 * Uses mock API function for demo/testing
 * Can be easily swapped for real API call when backend is ready
 */
export function useCreateGiftCard() {
  return useMutation<GiftCardResponse, Error, CreateGiftCardRequest>({
    mutationFn: createGiftCardMock,
  })
}
