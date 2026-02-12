"use client"

import { useQuery } from "@tanstack/react-query"
import { getClaimPreview, type ClaimPreviewResponse } from "@/lib/api"

/**
 * React Query hook for fetching claim preview
 */
export function useClaimPreview(claimSecret: string | null) {
  return useQuery<ClaimPreviewResponse, Error>({
    queryKey: ["claim-preview", claimSecret],
    queryFn: () => getClaimPreview(claimSecret!),
    enabled: !!claimSecret,
  })
}
