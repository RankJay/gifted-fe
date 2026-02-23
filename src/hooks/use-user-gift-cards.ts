"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getUserGiftCards, type UserGiftCardsResponse } from "@/lib/api/user";

export function useUserGiftCards(userId: string | null) {
  return useQuery<UserGiftCardsResponse, Error>({
    queryKey: ["user-gift-cards", userId],
    queryFn: () => getUserGiftCards(userId!),
    enabled: !!userId,
    retry: 2,
    placeholderData: keepPreviousData,
  });
}
