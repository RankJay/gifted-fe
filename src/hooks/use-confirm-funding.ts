"use client"

import { useMutation } from "@tanstack/react-query"
import {
  confirmEoaFunding,
  type ConfirmEoaFundingRequest,
  type ConfirmEoaFundingResponse,
} from "@/lib/api"

/**
 * React Query hook for confirming EOA funding
 */
export function useConfirmEoaFunding() {
  return useMutation<
    ConfirmEoaFundingResponse,
    Error,
    { giftCardId: string; data: ConfirmEoaFundingRequest }
  >({
    mutationFn: ({ giftCardId, data }) => confirmEoaFunding(giftCardId, data),
  })
}
