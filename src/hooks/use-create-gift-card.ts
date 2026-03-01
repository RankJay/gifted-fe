"use client";

import { useMutation } from "@tanstack/react-query";
import { initiateGiftCard, type InitiateGiftCardRequest, type InitiateGiftCardResponse } from "@/lib/api/gift-card";
import { useAuthToken } from "@/components/providers/auth-token-context";
import { ApiError } from "@/lib/api/client";

/**
 * React Query hook for creating gift cards (requires auth token).
 */
export function useCreateGiftCard() {
  const { token } = useAuthToken();

  return useMutation<InitiateGiftCardResponse, Error, InitiateGiftCardRequest>({
    mutationFn: (req) => {
      if (!token) throw new ApiError(401, "UNAUTHENTICATED", "Not authenticated");
      return initiateGiftCard(req, token);
    },
  });
}
