import { apiRequest } from "./client";

export interface ClaimPreviewResponse {
  amount: string;
  personalMessage: string | null;
  senderEmail: string;
  status: string;
  createdAt: string;
}

export interface ClaimGiftCardRequest {
  userId: string;
  walletAddress: string;
}

export interface ClaimGiftCardResponse {
  giftCardId: string;
  amount: string;
  status: string;
}

export async function getClaimPreview(claimSecret: string): Promise<ClaimPreviewResponse> {
  return apiRequest<ClaimPreviewResponse>(`/giftcard/claim/${claimSecret}`);
}

export async function claimGiftCard(
  claimSecret: string,
  req: ClaimGiftCardRequest,
): Promise<ClaimGiftCardResponse> {
  return apiRequest<ClaimGiftCardResponse>(`/giftcard/claim/${claimSecret}`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}
