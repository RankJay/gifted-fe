/**
 * Mock API function for gift card creation
 * Simulates API delay and returns mock data
 * Can be easily replaced with real API call when backend is ready
 */

export interface CreateGiftCardRequest {
  amount: string
  note?: string
  recipientEmail?: string
}

export interface GiftCardResponse {
  id: string
  claimLink: string
  amount: string
  state: string
  createdAt: string
}

/**
 * Generates a random 64-character hex string for claim secret
 */
function generateRandomSecret(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

/**
 * Mock function that simulates gift card creation
 * @param params - Gift card creation parameters
 * @returns Promise that resolves after 1-2 seconds with mock data
 */
export async function createGiftCardMock(
  params: CreateGiftCardRequest
): Promise<GiftCardResponse> {
  // Simulate API delay (1-2 seconds)
  const delay = Math.random() * 1000 + 1000 // 1000-2000ms
  await new Promise((resolve) => setTimeout(resolve, delay))

  // Generate mock response
  const secret = generateRandomSecret()
  const id = crypto.randomUUID()

  return {
    id,
    claimLink: `https://app.gifted.com/claim/${secret}`,
    amount: params.amount,
    state: "CREATED",
    createdAt: new Date().toISOString(),
  }
}
