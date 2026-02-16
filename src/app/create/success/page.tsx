"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCdpAuth } from "@/hooks/use-cdp-auth";
import { PageLoader } from "@/components/layout/page-loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getGiftCardById, type GiftCardDetailResponse } from "@/lib/api/gift-card";
import { toast } from "sonner";
import { Gift, Copy, Check, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

const MAX_POLL_ATTEMPTS = 30; // 30 attempts * 2 seconds = 60 seconds max
const POLL_INTERVAL_MS = 2000; // Poll every 2 seconds (webhook processes quickly)

const TERMINAL_STATUSES = new Set(["active", "claimed", "redeemed", "payment_failed"]);

export default function CreateSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useCdpAuth();
  const giftCardId = searchParams.get("giftCardId");

  const [giftCard, setGiftCard] = useState<GiftCardDetailResponse | null>(null);
  const [pollAttempts, setPollAttempts] = useState(0);
  const [copied, setCopied] = useState(false);

  // Use refs to track polling state and avoid stale closures
  const pollAttemptsRef = useRef(0);
  const isPollingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    isPollingRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pollGiftCardStatus = useCallback(async () => {
    if (!giftCardId || !user?.userId || !user?.evmAddress) {
      stopPolling();
      return;
    }

    // Check max attempts before making request
    if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
      stopPolling();
      toast.warning(
        "Payment is still processing. The gift card will be activated shortly. You can check back later.",
      );
      return;
    }

    // Check if we should continue polling
    if (!isPollingRef.current) {
      return;
    }

    try {
      const latest = await getGiftCardById(giftCardId, {
        userId: user.userId,
        walletAddress: user.evmAddress,
      });

      setGiftCard(latest);
      pollAttemptsRef.current += 1;
      setPollAttempts(pollAttemptsRef.current);

      // Stop polling if we reach a terminal state
      if (TERMINAL_STATUSES.has(latest.status)) {
        stopPolling();

        if (latest.status === "active" && latest.claimLink) {
          toast.success("Payment confirmed! Gift card is ready.");
        } else if (latest.status === "payment_failed") {
          toast.error("Payment failed. Please try again.");
        }
        return;
      }

      // Check max attempts after incrementing
      if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
        stopPolling();
        toast.warning(
          "Payment is still processing. The gift card will be activated shortly. You can check back later.",
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to check payment status";
      toast.error(message);
      stopPolling();
    }
  }, [giftCardId, user?.userId, user?.evmAddress, stopPolling]);

  useEffect(() => {
    if (!giftCardId) {
      toast.error("Missing gift card ID");
      router.push("/");
      return;
    }

    if (authLoading) return;

    // Reset polling state
    pollAttemptsRef.current = 0;
    setPollAttempts(0);
    isPollingRef.current = true;

    // Initial poll
    void pollGiftCardStatus();

    // Set up interval
    intervalRef.current = setInterval(() => {
      if (isPollingRef.current) {
        void pollGiftCardStatus();
      }
    }, POLL_INTERVAL_MS);

    // Cleanup on unmount or when dependencies change
    return () => {
      stopPolling();
    };
  }, [giftCardId, user?.userId, user?.evmAddress, authLoading, router, pollGiftCardStatus, stopPolling]);

  const handleCopyLink = async () => {
    if (!giftCard?.claimLink) return;

    try {
      await navigator.clipboard.writeText(giftCard.claimLink);
      setCopied(true);
      toast.success("Claim link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleCreateAnother = () => {
    router.push("/dashboard");
  };

  if (authLoading) return <PageLoader />;

  if (!giftCardId) {
    return null;
  }

  const isProcessing = giftCard?.status === "pending_payment" || !giftCard;
  const isActive = giftCard?.status === "active" && giftCard.claimLink;
  const isFailed = giftCard?.status === "payment_failed";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {isActive ? (
            <>
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                <Gift className="size-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Payment Successful!</CardTitle>
              <CardDescription>Your gift card is ready to share</CardDescription>
            </>
          ) : isFailed ? (
            <>
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="size-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Payment Failed</CardTitle>
              <CardDescription>There was an issue processing your payment</CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                <Spinner className="size-8" />
              </div>
              <CardTitle className="text-2xl">Processing Payment</CardTitle>
              <CardDescription>
                Please wait while we confirm your payment... ({pollAttempts}/{MAX_POLL_ATTEMPTS})
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {isActive && giftCard.claimLink && (
            <>
              <div className="space-y-2">
                <label htmlFor="claim-link" className="text-sm font-medium">
                  Share this link
                </label>
                <div className="flex gap-2">
                  <Input
                    id="claim-link"
                    readOnly
                    value={giftCard.claimLink}
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    onClick={handleCopyLink}
                    variant="outline"
                    size="icon"
                    aria-label={copied ? "Link copied" : "Copy link"}
                  >
                    {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this link privately with the recipient
                </p>
              </div>
              <div className="rounded-md bg-muted p-3 text-sm">
                <p>
                  <span className="font-medium">Amount:</span> ${giftCard.amount} USDC
                </p>
                {giftCard.recipientEmail && (
                  <p>
                    <span className="font-medium">Recipient:</span> {giftCard.recipientEmail}
                  </p>
                )}
              </div>
            </>
          )}

          {isFailed && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your payment could not be processed. Please try creating a new gift card.
              </p>
              <Button onClick={handleCreateAnother} className="w-full">
                Create New Gift Card
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We're confirming your payment with Coinbase. This usually takes just a few seconds.
              </p>
              {giftCard && (
                <div className="rounded-md bg-muted p-3 text-sm">
                  <p>
                    <span className="font-medium">Gift Card ID:</span> {giftCard.id}
                  </p>
                  <p>
                    <span className="font-medium">Amount:</span> ${giftCard.amount} USDC
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        {isActive && (
          <div className="border-t p-4">
            <Button onClick={handleCreateAnother} variant="outline" className="w-full">
              Create Another Gift Card
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
