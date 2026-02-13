"use client";

import { useMutation } from "@tanstack/react-query";
import {
  initiateGiftCard,
  type InitiateGiftCardRequest,
  type InitiateGiftCardResponse,
} from "@/lib/api/gift-card";

/**
 * React Query hook for creating gift cards
 */
export function useCreateGiftCard() {
  return useMutation<InitiateGiftCardResponse, Error, InitiateGiftCardRequest>({
    mutationFn: initiateGiftCard,
  });
}
