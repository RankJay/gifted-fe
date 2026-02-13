"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/layout/page-loader";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { Gift, Mail, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { formatAmount, formatDate } from "@/lib/format";
import { GIFT_CARD_STATUS } from "@/lib/constants";
import { useClaimPage } from "@/hooks/use-claim-page";

export function ClaimContent() {
  const router = useRouter();
  const {
    preview,
    previewError,
    user,
    isLoading,
    isClaiming,
    isRegistering,
    handleRegisterAndClaim,
  } = useClaimPage();

  if (isLoading) return <PageLoader />;

  if (previewError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="size-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Gift Card Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
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
    );
  }

  if (!preview) return null;

  const isClaimed = preview.status === GIFT_CARD_STATUS.CLAIMED;
  const isRedeemed = preview.status === GIFT_CARD_STATUS.REDEEMED;
  const isActive = preview.status === GIFT_CARD_STATUS.ACTIVE;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Gift className="size-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">You Received a Gift Card!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">${formatAmount(preview.amount)}</div>
            <p className="mt-1 text-sm text-muted-foreground">USDC</p>
          </div>

          <Separator />

          {preview.personalMessage && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Personal Message</p>
              <div className="rounded-lg bg-muted p-4">
                <p className="whitespace-pre-wrap text-sm">{preview.personalMessage}</p>
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
                <p className="text-sm font-medium">{formatDate(preview.createdAt, true)}</p>
              </div>
            </div>
          </div>

          {isClaimed && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  This gift card has already been claimed
                </p>
              </div>
            </div>
          )}

          {isRedeemed && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
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
                  <p className="text-center text-sm text-muted-foreground">
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
  );
}
