import { getCurrentUser } from "@coinbase/cdp-core"

/**
 * Get the current authenticated user's information.
 * This includes user ID which can be used for backend authentication.
 */
export async function getCdpUser() {
  try {
    const user = await getCurrentUser()
    return user
  } catch (error) {
    console.error("Failed to get CDP user:", error)
    return null
  }
}

/**
 * Get the user ID for backend authentication.
 * You can use this user ID to generate a JWT on your backend.
 */
export async function getCdpUserId(): Promise<string | null> {
  const user = await getCdpUser()
  return user?.userId ?? null
}
