"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/page-container";
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

  const isPending = isClaiming || isRegistering;

  return (
    <PageContainer>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center gap-6 pt-12"
          >
            <Skeleton className="h-16 w-40 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded" />
            <div className="w-full mt-8 space-y-3">
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          </motion.div>
        ) : previewError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6 pt-12"
          >
            <p className="text-2xl font-bold">Gift card not found</p>
            <p className="text-sm text-[#8A8A8A] text-center">
              {previewError.message || "This link is invalid or has expired."}
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full h-14 rounded-full bg-foreground text-background text-base font-semibold hover:bg-foreground/90 transition-colors"
            >
              Go home
            </button>
          </motion.div>
        ) : preview ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col min-h-[calc(100dvh-4rem)]"
          >
            {/* Amount + message — same layout as Image 5 */}
            <div className="flex flex-col items-center gap-2 pt-12 pb-8">
              <span className="text-7xl font-bold tracking-tighter">
                {Number(preview.amount).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              {preview.personalMessage && (
                <p className="text-base text-neutral-500 font-medium tracking-tight text-center max-w-60">
                  {preview.personalMessage}
                </p>
              )}
              <p className="text-xs text-neutral-500 font-medium tracking-tight mt-1">
                from {preview.senderEmail}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {preview.status === GIFT_CARD_STATUS.ACTIVE && (
                <>
                  {user?.userId && user?.evmAddress ? (
                    <button
                      onClick={handleRegisterAndClaim}
                      disabled={isPending}
                      className="w-full h-14 rounded-2xl bg-foreground text-background text-base font-medium tracking-tight flex items-center justify-center gap-2 hover:bg-foreground/90 disabled:opacity-50 transition-colors"
                    >
                      {isPending ? (
                        <>
                          <Spinner className="size-4" />
                          Claiming...
                        </>
                      ) : (
                        "Claim"
                      )}
                    </button>
                  ) : (
                    <>
                      <p className="text-center text-sm text-[#8A8A8A]">
                        Sign in to claim this gift card
                      </p>
                      <button
                        onClick={() => router.push("/")}
                        className="w-full h-14 rounded-full bg-foreground text-background text-base font-semibold hover:bg-foreground/90 transition-colors"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </>
              )}

              {(preview.status === GIFT_CARD_STATUS.CLAIMED ||
                preview.status === GIFT_CARD_STATUS.REDEEMED) && (
                <>
                  <p className="text-center text-sm text-[#8A8A8A]">
                    {preview.status === GIFT_CARD_STATUS.CLAIMED
                      ? "This gift card has already been claimed."
                      : "This gift card has already been redeemed."}
                  </p>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="w-full h-14 rounded-full bg-foreground text-background text-base font-semibold hover:bg-foreground/90 transition-colors"
                  >
                    Go to dashboard
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageContainer>
  );
}
