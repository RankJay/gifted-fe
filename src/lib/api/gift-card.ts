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
