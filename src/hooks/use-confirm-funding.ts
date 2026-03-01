"use client";

import { useMutation } from "@tanstack/react-query";
import { confirmEoaFunding, type ConfirmEoaFundingRequest, type ConfirmEoaFundingResponse } from "@/lib/api/gift-card";
import { useAuthToken } from "@/components/providers/auth-token-context";
import { ApiError } from "@/lib/api/client";

/**
 * React Query hook for confirming EOA funding (requires auth token).
 */
export function useConfirmEoaFunding() {
  const { token } = useAuthToken();

  return useMutation<
    ConfirmEoaFundingResponse,
    Error,
    { giftCardId: string; data: ConfirmEoaFundingRequest }
  >({
    mutationFn: ({ giftCardId, data }) => {
      if (!token) throw new ApiError(401, "UNAUTHENTICATED", "Not authenticated");
      return confirmEoaFunding(giftCardId, data, token);
    },
  });
}
