import { apiRequest, apiRequestWithAuth } from "./client";
import type { PaymentMethod } from "../constants";

export interface InitiateGiftCardRequest {
  amount: number;
  personalMessage?: string;
  recipientEmail?: string;
  paymentMethod: PaymentMethod;
}

export interface InitiateGiftCardResponse {
  giftCardId: string;
  totalCharged: string;
  fee: string;
  onrampUrl?: string;
  treasuryAddress?: string;
}

export interface ConfirmEoaFundingRequest {
  txHash: string;
}

export interface ConfirmEoaFundingResponse {
  giftCardId: string;
  status: string;
  claimLink: string;
}

export interface RedeemGiftCardResponse {
  giftCardId: string;
  amount: string;
  txHash: string;
  status: string;
}

export interface ClaimGiftCardResponse {
  giftCardId: string;
  amount: string;
  status: string;
}

export interface GiftCardDetailResponse {
  id: string;
  senderId: string;
  amount: string;
  fee: string;
  totalCharged: string;
  status: string;
  paymentMethod: PaymentMethod;
  personalMessage: string | null;
  recipientEmail: string | null;
  fundingTxHash: string | null;
  redemptionTxHash: string | null;
  claimedById: string | null;
  tokenId: string | null;
  createdAt: string;
  claimedAt: string | null;
  redeemedAt: string | null;
  claimLink: string | null;
}

export async function initiateGiftCard(
  req: InitiateGiftCardRequest,
  token: string,
): Promise<InitiateGiftCardResponse> {
  return apiRequestWithAuth<InitiateGiftCardResponse>("/giftcard/initiate", token, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function confirmEoaFunding(
  giftCardId: string,
  req: ConfirmEoaFundingRequest,
  token: string,
): Promise<ConfirmEoaFundingResponse> {
  return apiRequestWithAuth<ConfirmEoaFundingResponse>(
    `/giftcard/${giftCardId}/confirm-eoa-funding`,
    token,
    {
      method: "POST",
      body: JSON.stringify(req),
    },
  );
}

export async function redeemGiftCard(
  giftCardId: string,
  token: string,
): Promise<RedeemGiftCardResponse> {
  return apiRequestWithAuth<RedeemGiftCardResponse>(`/giftcard/${giftCardId}/redeem`, token, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function getGiftCardById(
  giftCardId: string,
  token: string,
): Promise<GiftCardDetailResponse> {
  return apiRequestWithAuth<GiftCardDetailResponse>(`/giftcard/${giftCardId}`, token);
}

export async function getUserGiftCards(userId: string, token: string) {
  return apiRequestWithAuth(`/user/${userId}/gift-cards`, token);
}

// Claim preview is public (no auth needed)
export async function getClaimPreview(claimSecret: string) {
  return apiRequest(`/giftcard/claim/${claimSecret}`);
}

// Claim gift card uses a claim secret; still requires user auth
export async function claimGiftCard(
  claimSecret: string,
  token: string,
): Promise<ClaimGiftCardResponse> {
  return apiRequestWithAuth<ClaimGiftCardResponse>(`/giftcard/claim/${claimSecret}`, token, {
    method: "POST",
    body: JSON.stringify({}),
  });
}
