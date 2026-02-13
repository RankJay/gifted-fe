import { apiRequest } from "./client";
import type { GiftCardSummary } from "./types";

export interface RegisterRequest {
  email: string;
  walletAddress: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  walletAddress: string;
}

export interface UserGiftCardsResponse {
  sent: GiftCardSummary[];
  received: GiftCardSummary[];
}

export async function registerUser(req: RegisterRequest): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/user/register", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function getUserGiftCards(userId: string): Promise<UserGiftCardsResponse> {
  return apiRequest<UserGiftCardsResponse>(`/user/${userId}/gift-cards`);
}
