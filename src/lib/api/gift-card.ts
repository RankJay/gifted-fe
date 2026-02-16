import { apiRequest } from "./client";
import type { PaymentMethod } from "../constants";

export interface InitiateGiftCardRequest {
  userId: string;
  walletAddress: string;
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
  userId: string;
  walletAddress: string;
  txHash: string;
}

export interface ConfirmEoaFundingResponse {
  giftCardId: string;
  status: string;
  claimLink: string;
}

export interface RedeemGiftCardRequest {
  userId: string;
  walletAddress: string;
}

export interface RedeemGiftCardResponse {
  giftCardId: string;
  amount: string;
  txHash: string;
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

export interface GetGiftCardRequest {
  userId: string;
  walletAddress: string;
}

export async function initiateGiftCard(
  req: InitiateGiftCardRequest,
): Promise<InitiateGiftCardResponse> {
  return apiRequest<InitiateGiftCardResponse>("/giftcard/initiate", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function confirmEoaFunding(
  giftCardId: string,
  req: ConfirmEoaFundingRequest,
): Promise<ConfirmEoaFundingResponse> {
  return apiRequest<ConfirmEoaFundingResponse>(`/giftcard/${giftCardId}/confirm-eoa-funding`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function redeemGiftCard(
  giftCardId: string,
  req: RedeemGiftCardRequest,
): Promise<RedeemGiftCardResponse> {
  return apiRequest<RedeemGiftCardResponse>(`/giftcard/${giftCardId}/redeem`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function getGiftCardById(
  giftCardId: string,
  req: GetGiftCardRequest,
): Promise<GiftCardDetailResponse> {
  const query = new URLSearchParams({
    userId: req.userId,
    walletAddress: req.walletAddress,
  });

  return apiRequest<GiftCardDetailResponse>(`/giftcard/${giftCardId}?${query.toString()}`);
}
