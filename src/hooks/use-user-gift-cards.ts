"use client"

import { useQuery } from "@tanstack/react-query"
import { getUserGiftCards, type UserGiftCardsResponse } from "@/lib/api"

/**
 * React Query hook for fetching user's gift cards
 */
export function useUserGiftCards(userId: string | null) {
  return useQuery<UserGiftCardsResponse, Error>({
    queryKey: ["user-gift-cards", userId],
    queryFn: () => getUserGiftCards(userId!),
    enabled: !!userId,
  })
}
