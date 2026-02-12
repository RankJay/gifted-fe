"use client"

import { useParams, useRouter } from "next/navigation"
import { useCdpAuth } from "@/hooks/use-cdp-auth"
import { useClaimPreview } from "@/hooks/use-claim-preview"
import { useClaimGiftCard } from "@/hooks/use-claim-gift-card"
import { useRegisterUser } from "@/hooks/use-register-user"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import { Gift, Mail, Calendar, CheckCircle2, XCircle } from "lucide-react"
import { useEffect } from "react"

export default function ClaimPage() {
  const params = useParams()
  const router = useRouter()
  const claimSecret = params?.claimSecret as string
  const { user, isLoading: authLoading } = useCdpAuth()
  const { data: preview, isLoading: previewLoading, error: previewError } = useClaimPreview(
    claimSecret || null
  )
  const { mutate: registerUser, isPending: isRegistering } = useRegisterUser()
  const { mutate: claimCard, isPending: isClaiming } = useClaimGiftCard()

  useEffect(() => {
    if (!claimSecret || !/^[a-fA-F0-9]{64}$/.test(claimSecret)) {
      toast.error("Invalid claim link")
      router.push("/")
    }
  }, [claimSecret, router])

  const handleRegisterAndClaim = async () => {
    if (!user?.userId || !user?.evmAddress || !user?.email) {
      toast.error("Please sign in with a wallet to claim this gift card")
      return
    }

    if (!claimSecret) return

    // Register user first if needed
    registerUser(
      {
        email: user.email,
        walletAddress: user.evmAddress,
      },
      {
        onSuccess: () => {
          handleClaim()
        },
        onError: (err) => {
          // If user already exists, continue anyway
          handleClaim()
        },
      }
    )
  }

  const handleClaim = () => {
    if (!user?.userId || !user?.evmAddress || !claimSecret) return

    claimCard(
      {
        claimSecret,
        data: {
          userId: user.userId,
          walletAddress: user.evmAddress,
        },
      },
      {
        onSuccess: () => {
          toast.success("Gift card claimed successfully!")
          router.push("/dashboard")
        },
        onError: (err) => {
          toast.error(err.message || "Failed to claim gift card")
        },
      }
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date)
  }

  if (authLoading || previewLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (previewError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="size-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Gift Card Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">
              {previewError.message || "This gift card link is invalid or has expired."}
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")} className="w-full">
              Go Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!preview) {
    return null
  }

  const isClaimed = preview.status === "claimed"
  const isRedeemed = preview.status === "redeemed"
  const isActive = preview.status === "active"

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Gift className="size-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">You Received a Gift Card!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">${preview.amount}</div>
            <p className="text-muted-foreground text-sm mt-1">USDC</p>
          </div>

          <Separator />

          {preview.personalMessage && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Personal Message</p>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm whitespace-pre-wrap">{preview.personalMessage}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">From</p>
                <p className="text-sm font-medium">{preview.senderEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Sent on</p>
                <p className="text-sm font-medium">{formatDate(preview.createdAt)}</p>
              </div>
            </div>
          </div>

          {isClaimed && (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  This gift card has already been claimed
                </p>
              </div>
            </div>
          )}

          {isRedeemed && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  This gift card has already been redeemed
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-2">
          {isActive && (
            <>
              {user?.userId && user?.evmAddress ? (
                <Button
                  onClick={handleRegisterAndClaim}
                  disabled={isClaiming || isRegistering}
                  className="w-full"
                >
                  {isClaiming || isRegistering ? (
                    <>
                      <Spinner className="mr-2" />
                      Claiming...
                    </>
                  ) : (
                    "Claim Gift Card"
                  )}
                </Button>
              ) : (
                <div className="w-full space-y-2">
                  <p className="text-sm text-muted-foreground text-center">
                    Please sign in with a wallet to claim this gift card
                  </p>
                  <Button onClick={() => router.push("/")} className="w-full" variant="outline">
                    Go to Sign In
                  </Button>
                </div>
              )}
            </>
          )}
          {(isClaimed || isRedeemed) && (
            <Button onClick={() => router.push("/dashboard")} className="w-full" variant="outline">
              Go to Dashboard
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
