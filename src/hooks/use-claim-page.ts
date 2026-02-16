"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useCdpAuth } from "@/hooks/use-cdp-auth";
import { useClaimPreview } from "@/hooks/use-claim-preview";
import { useClaimGiftCard } from "@/hooks/use-claim-gift-card";
import { useRegisterAndThen } from "@/hooks/use-register-and-then";
import { VALIDATION_PATTERNS } from "@/lib/constants";

export function useClaimPage() {
  const params = useParams();
  const router = useRouter();
  const claimSecret = (params?.claimSecret as string) ?? null;

  const { user, isLoading: authLoading } = useCdpAuth();
  const {
    data: preview,
    isLoading: previewLoading,
    error: previewError,
  } = useClaimPreview(claimSecret);
  const { registerAndThen, isRegistering } = useRegisterAndThen();
  const { mutate: claimCard, isPending: isClaiming } = useClaimGiftCard();

  useEffect(() => {
    if (!claimSecret || !VALIDATION_PATTERNS.CLAIM_SECRET.test(claimSecret)) {
      toast.error("Invalid claim link");
      router.replace("/");
    }
  }, [claimSecret, router]);

  const handleRegisterAndClaim = () => {
    if (!claimSecret) return;
    registerAndThen(user, (backendUserId) => handleClaim(backendUserId), {
      signInMessage: "Please sign in with a wallet to claim this gift card",
    });
  };

  const handleClaim = (backendUserId: string) => {
    if (!user?.evmAddress || !claimSecret) return;

    claimCard(
      { claimSecret, data: { userId: backendUserId, walletAddress: user.evmAddress } },
      {
        onSuccess: () => {
          toast.success("Gift card claimed successfully!");
          router.replace("/dashboard");
        },
        onError: (err) => toast.error(err.message ?? "Failed to claim gift card"),
      },
    );
  };

  return {
    claimSecret,
    preview,
    previewError,
    user,
    isLoading: authLoading || previewLoading,
    isClaiming,
    isRegistering,
    handleRegisterAndClaim,
  };
}
