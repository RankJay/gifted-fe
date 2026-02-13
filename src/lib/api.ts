/**
 * API client for Gifted backend
 * All endpoints use Encore.dev API structure
 * Uses Effect for resilient requests with retry, timeout, and abort support
 */

import { Effect, Schedule, Duration } from "effect";
import { TIMEOUTS, API_CONFIG, API_BASE_URL } from "./constants";

interface ApiError {
  code: string;
  message: string;
}

interface RequestOptions extends RequestInit {
  signal?: AbortSignal;
  correlationId?: string;
}

/**
 * Create timeout abort signal (polyfill for environments without AbortSignal.timeout)
 */
function createTimeoutSignal(timeoutMs: number): AbortSignal {
  if (typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(timeoutMs);
  }

  // Polyfill for older environments
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

/**
 * Combine multiple abort signals
 */
function combineAbortSignals(signals: AbortSignal[]): AbortSignal {
  if (signals.length === 0) {
    const controller = new AbortController();
    return controller.signal;
  }

  if (signals.length === 1) {
    return signals[0];
  }

  // Use AbortSignal.any if available, otherwise create combined controller
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any(signals);
  }

  // Polyfill: abort if any signal aborts
  const controller = new AbortController();
  signals.forEach((signal) => {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
    }
  });
  return controller.signal;
}

/**
 * Effect-based API request implementation
 * Includes retry, timeout, abort, and correlation ID support
 */
function apiRequestEffect<T>(endpoint: string, options?: RequestOptions): Effect.Effect<T, Error> {
  const url = `${API_BASE_URL}${endpoint}`;
  const correlationId = options?.correlationId || crypto.randomUUID();

  // Create abort signal combining user abort + timeout
  const timeoutSignal = createTimeoutSignal(TIMEOUTS.API_REQUEST);
  const abortSignals = options?.signal ? [options.signal, timeoutSignal] : [timeoutSignal];
  const combinedSignal = combineAbortSignals(abortSignals);

  return Effect.gen(function* (_) {
    const response = yield* _(
      Effect.tryPromise({
        try: () =>
          fetch(url, {
            ...options,
            signal: combinedSignal,
            headers: {
              "Content-Type": "application/json",
              "X-Request-ID": correlationId,
              ...options?.headers,
            },
          }),
        catch: (error) =>
          error instanceof Error ? error : new Error(`Fetch failed: ${String(error)}`),
      }),
    );

    if (!response.ok) {
      let errorMessage = `API request failed: ${response.statusText}`;
      const errorOption = yield* _(
        Effect.tryPromise({
          try: () => response.json() as Promise<ApiError>,
          catch: () => new Error("Failed to parse error response"),
        }).pipe(Effect.option),
      );
      if (errorOption._tag === "Some") {
        errorMessage = errorOption.value.message || errorMessage;
      }
      yield* _(Effect.fail(new Error(errorMessage)));
    }

    return yield* _(
      Effect.tryPromise({
        try: () => response.json() as Promise<T>,
        catch: (error) =>
          error instanceof Error ? error : new Error(`JSON parse failed: ${String(error)}`),
      }),
    );
  }).pipe(
    Effect.timeout(Duration.millis(TIMEOUTS.API_REQUEST)),
    Effect.retry(
      Schedule.exponential(Duration.millis(TIMEOUTS.API_RETRY_DELAY)).pipe(
        Schedule.compose(Schedule.recurs(API_CONFIG.RETRY_COUNT)),
      ),
    ),
  );
}

/**
 * Promise-based API request wrapper using Effect internally
 */
async function apiRequest<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  return Effect.runPromise(apiRequestEffect<T>(endpoint, options));
}

// User API
export interface RegisterRequest {
  email: string;
  walletAddress: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  walletAddress: string;
}

export async function registerUser(req: RegisterRequest): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/user/register", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export interface GetUserResponse {
  userId: string;
  email: string;
  walletAddress: string;
  createdAt: string;
}

export async function getUser(userId: string): Promise<GetUserResponse> {
  return apiRequest<GetUserResponse>(`/user/${userId}`);
}

export interface GiftCardSummary {
  id: string;
  amount: string;
  status: string;
  personalMessage: string | null;
  createdAt: string;
  claimedAt: string | null;
  redeemedAt: string | null;
  claimLink?: string | null;
  senderEmail?: string | null;
}

export interface UserGiftCardsResponse {
  sent: GiftCardSummary[];
  received: GiftCardSummary[];
}

export async function getUserGiftCards(userId: string): Promise<UserGiftCardsResponse> {
  return apiRequest<UserGiftCardsResponse>(`/user/${userId}/gift-cards`);
}

// Gift Card API
export interface InitiateGiftCardRequest {
  userId: string;
  walletAddress: string;
  amount: number;
  personalMessage?: string;
  recipientEmail?: string;
  paymentMethod: "onramp" | "eoa_transfer";
}

export interface InitiateGiftCardResponse {
  giftCardId: string;
  totalCharged: string;
  fee: string;
  onrampUrl?: string;
  treasuryAddress?: string;
}

export async function initiateGiftCard(
  req: InitiateGiftCardRequest,
): Promise<InitiateGiftCardResponse> {
  return apiRequest<InitiateGiftCardResponse>("/giftcard/initiate", {
    method: "POST",
    body: JSON.stringify(req),
  });
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

export async function confirmEoaFunding(
  giftCardId: string,
  req: ConfirmEoaFundingRequest,
): Promise<ConfirmEoaFundingResponse> {
  return apiRequest<ConfirmEoaFundingResponse>(`/giftcard/${giftCardId}/confirm-eoa-funding`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export interface GiftCardDetail {
  id: string;
  senderId: string;
  amount: string;
  fee: string;
  totalCharged: string;
  status: string;
  paymentMethod: string;
  personalMessage: string | null;
  recipientEmail: string | null;
  fundingTxHash: string | null;
  redemptionTxHash: string | null;
  claimedById: string | null;
  createdAt: string;
  claimedAt: string | null;
  redeemedAt: string | null;
}

export async function getGiftCard(
  giftCardId: string,
  userId: string,
  walletAddress: string,
): Promise<GiftCardDetail> {
  const params = new URLSearchParams({
    userId,
    walletAddress,
  });
  return apiRequest<GiftCardDetail>(`/giftcard/${giftCardId}?${params.toString()}`);
}

// Claim API
export interface ClaimPreviewResponse {
  amount: string;
  personalMessage: string | null;
  senderEmail: string;
  status: string;
  createdAt: string;
}

export async function getClaimPreview(claimSecret: string): Promise<ClaimPreviewResponse> {
  return apiRequest<ClaimPreviewResponse>(`/giftcard/claim/${claimSecret}`);
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

export async function claimGiftCard(
  claimSecret: string,
  req: ClaimGiftCardRequest,
): Promise<ClaimGiftCardResponse> {
  return apiRequest<ClaimGiftCardResponse>(`/giftcard/claim/${claimSecret}`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

// Redeem API
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

export async function redeemGiftCard(
  giftCardId: string,
  req: RedeemGiftCardRequest,
): Promise<RedeemGiftCardResponse> {
  return apiRequest<RedeemGiftCardResponse>(`/giftcard/${giftCardId}/redeem`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}
