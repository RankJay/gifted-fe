"use client"

import { useCdpAuth } from "@/hooks/use-cdp-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { toast } from "sonner"

/**
 * Example component showing how to access CDP authentication information
 * and use it for backend authentication.
 */
export function AuthInfo() {
  const { user, isLoading, isAuthenticated } = useCdpAuth()

  const handleCopyUserId = async () => {
    if (!user?.userId) return
    try {
      await navigator.clipboard.writeText(user.userId)
      toast.success("User ID copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy user ID")
    }
  }

  const handleGetBackendToken = async () => {
    if (!user?.userId) return

    try {
      // Example: Send userId to your backend to get a JWT token
      const response = await fetch("/api/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.userId }),
      })

      if (!response.ok) {
        throw new Error("Failed to get token")
      }

      const { token } = await response.json()
      
      // Store token or use it for authenticated requests
      console.log("Backend JWT token:", token)
      toast.success("Token retrieved successfully!")
      
      // Example: Store in memory (don't store sensitive tokens in localStorage)
      // sessionStorage.setItem("auth_token", token)
    } catch (error) {
      console.error("Failed to get backend token:", error)
      toast.error("Failed to get backend token")
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated || !user) {
    return <div>Not authenticated</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">User ID</label>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
              {user.userId}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyUserId}
              aria-label="Copy user ID"
            >
              <Copy className="size-4" />
            </Button>
          </div>
          <p className="text-muted-foreground text-xs mt-1">
            Use this ID to authenticate with your backend
          </p>
        </div>

        {user.email && (
          <div>
            <label className="text-sm font-medium">Email</label>
            <p className="text-sm mt-1">{user.email}</p>
          </div>
        )}

        {user.evmAddress && (
          <div>
            <label className="text-sm font-medium">EVM Address</label>
            <p className="text-sm font-mono mt-1">{user.evmAddress}</p>
          </div>
        )}

        {user.solanaAddress && (
          <div>
            <label className="text-sm font-medium">Solana Address</label>
            <p className="text-sm font-mono mt-1">{user.solanaAddress}</p>
          </div>
        )}

        <Button onClick={handleGetBackendToken} className="w-full">
          Get Backend JWT Token
        </Button>
      </CardContent>
    </Card>
  )
}
