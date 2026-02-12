/**
 * API client for Gifted backend
 * All endpoints use Encore.dev API structure
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

interface ApiError {
  code: string
  message: string
}

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!response.ok) {
    let errorMessage = `API request failed: ${response.statusText}`
    try {
      const error: ApiError = await response.json()
      errorMessage = error.message || errorMessage
    } catch {
      // If response is not JSON, use status text
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

// User API
export interface RegisterRequest {
  email: string
  walletAddress: string
}

export interface RegisterResponse {
  userId: string
  email: string
  walletAddress: string
}

export async function registerUser(req: RegisterRequest): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/user/register", {
    method: "POST",
    body: JSON.stringify(req),
  })
}

export interface GetUserResponse {
  userId: string
  email: string
  walletAddress: string
  createdAt: string
}

export async function getUser(userId: string): Promise<GetUserResponse> {
  return apiRequest<GetUserResponse>(`/user/${userId}`)
}

export interface GiftCardSummary {
  id: string
  amount: string
  status: string
  personalMessage: string | null
  createdAt: string
  claimedAt: string | null
  redeemedAt: string | null
  claimLink?: string | null
  senderEmail?: string | null
}

export interface UserGiftCardsResponse {
  sent: GiftCardSummary[]
  received: GiftCardSummary[]
}

export async function getUserGiftCards(userId: string): Promise<UserGiftCardsResponse> {
  return apiRequest<UserGiftCardsResponse>(`/user/${userId}/gift-cards`)
}

// Gift Card API
export interface InitiateGiftCardRequest {
  userId: string
  walletAddress: string
  amount: number
  personalMessage?: string
  recipientEmail?: string
  paymentMethod: "onramp" | "eoa_transfer"
}

export interface InitiateGiftCardResponse {
  giftCardId: string
  totalCharged: string
  fee: string
  onrampUrl?: string
  treasuryAddress?: string
}

export async function initiateGiftCard(
  req: InitiateGiftCardRequest
): Promise<InitiateGiftCardResponse> {
  return apiRequest<InitiateGiftCardResponse>("/giftcard/initiate", {
    method: "POST",
    body: JSON.stringify(req),
  })
}

export interface ConfirmEoaFundingRequest {
  userId: string
  walletAddress: string
  txHash: string
}

export interface ConfirmEoaFundingResponse {
  giftCardId: string
  status: string
  claimLink: string
}

export async function confirmEoaFunding(
  giftCardId: string,
  req: ConfirmEoaFundingRequest
): Promise<ConfirmEoaFundingResponse> {
  return apiRequest<ConfirmEoaFundingResponse>(
    `/giftcard/${giftCardId}/confirm-eoa-funding`,
    {
      method: "POST",
      body: JSON.stringify(req),
    }
  )
}

export interface GiftCardDetail {
  id: string
  senderId: string
  amount: string
  fee: string
  totalCharged: string
  status: string
  paymentMethod: string
  personalMessage: string | null
  recipientEmail: string | null
  fundingTxHash: string | null
  redemptionTxHash: string | null
  claimedById: string | null
  createdAt: string
  claimedAt: string | null
  redeemedAt: string | null
}

export async function getGiftCard(
  giftCardId: string,
  userId: string,
  walletAddress: string
): Promise<GiftCardDetail> {
  const params = new URLSearchParams({
    userId,
    walletAddress,
  })
  return apiRequest<GiftCardDetail>(`/giftcard/${giftCardId}?${params.toString()}`)
}

// Claim API
export interface ClaimPreviewResponse {
  amount: string
  personalMessage: string | null
  senderEmail: string
  status: string
  createdAt: string
}

export async function getClaimPreview(claimSecret: string): Promise<ClaimPreviewResponse> {
  return apiRequest<ClaimPreviewResponse>(`/giftcard/claim/${claimSecret}`)
}

export interface ClaimGiftCardRequest {
  userId: string
  walletAddress: string
}

export interface ClaimGiftCardResponse {
  giftCardId: string
  amount: string
  status: string
}

export async function claimGiftCard(
  claimSecret: string,
  req: ClaimGiftCardRequest
): Promise<ClaimGiftCardResponse> {
  return apiRequest<ClaimGiftCardResponse>(`/giftcard/claim/${claimSecret}`, {
    method: "POST",
    body: JSON.stringify(req),
  })
}

// Redeem API
export interface RedeemGiftCardRequest {
  userId: string
  walletAddress: string
}

export interface RedeemGiftCardResponse {
  giftCardId: string
  amount: string
  txHash: string
  status: string
}

export async function redeemGiftCard(
  giftCardId: string,
  req: RedeemGiftCardRequest
): Promise<RedeemGiftCardResponse> {
  return apiRequest<RedeemGiftCardResponse>(`/giftcard/${giftCardId}/redeem`, {
    method: "POST",
    body: JSON.stringify(req),
  })
}
