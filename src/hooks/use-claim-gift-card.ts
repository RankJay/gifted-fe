"use client";

import { useMutation } from "@tanstack/react-query";
import { claimGiftCard, type ClaimGiftCardResponse } from "@/lib/api/gift-card";
import { useAuthToken } from "@/components/providers/auth-token-context";
import { ApiError } from "@/lib/api/client";

export type { ClaimGiftCardResponse };

/**
 * React Query hook for claiming a gift card (requires auth token).
 */
export function useClaimGiftCard() {
  const { token } = useAuthToken();

  return useMutation<ClaimGiftCardResponse, Error, { claimSecret: string }>({
    mutationFn: ({ claimSecret }) => {
      if (!token) throw new ApiError(401, "UNAUTHENTICATED", "Not authenticated");
      return claimGiftCard(claimSecret, token);
    },
  });
}
