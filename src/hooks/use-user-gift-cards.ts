"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getUserGiftCards, type UserGiftCardsResponse } from "@/lib/api/user";
import { useAuthToken } from "@/components/providers/auth-token-context";

export function useUserGiftCards(userId: string | null) {
  const { token } = useAuthToken();

  return useQuery<UserGiftCardsResponse, Error>({
    queryKey: ["user-gift-cards", userId],
    queryFn: () => getUserGiftCards(userId!, token!),
    enabled: !!userId && !!token,
    retry: 2,
    placeholderData: keepPreviousData,
  });
}
