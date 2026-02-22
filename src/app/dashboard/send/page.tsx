"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { AmountHeader } from "@/components/send/amount-header";
import { useSendParams } from "@/hooks/use-send-params";
import { useCdpAuth } from "@/hooks/use-cdp-auth";
import { useBackendUser } from "@/components/providers/backend-user-context";
import { useConfirmEoaFunding } from "@/hooks/use-confirm-funding";
import { useCreateGiftCard } from "@/hooks/use-create-gift-card";
import { useState } from "react";
import { sendUsdc } from "@coinbase/cdp-core";
import { getCdpNetworkName, PAYMENT_METHOD } from "@/lib/constants";
import { usePublicClient } from "wagmi";

export default function SendPage() {
  const router = useRouter();
  const { user } = useCdpAuth();
  const { backendUserId: contextUserId } = useBackendUser();
  const publicClient = usePublicClient();
  const [params] = useSendParams();
  const { mutateAsync: confirmFunding } = useConfirmEoaFunding();
  const { mutateAsync: createGiftCard } = useCreateGiftCard();
  const [isPayingWithBalance, setIsPayingWithBalance] = useState(false);
  const [isCreatingOnramp, setIsCreatingOnramp] = useState(false);

  const {
    amount,
    message,
    email,
    giftCardId,
    treasuryAddress,
    totalCharged,
    userId: urlUserId,
  } = params;
  // Prefer userId from URL params (set at gift card creation time) for reliability,
  // fall back to context in case of direct navigation
  const backendUserId = urlUserId ?? contextUserId;

  const handlePayWithBalance = async () => {
    if (!user?.evmAddress || !backendUserId || !giftCardId || !treasuryAddress || !totalCharged) {
      toast.error("Missing payment details");
      return;
    }
    setIsPayingWithBalance(true);
    try {
      // Send totalCharged (face value + fee) — backend verifies this exact amount on-chain
      const result = await sendUsdc({
        from: user.evmAddress as `0x${string}`,
        to: treasuryAddress as `0x${string}`,
        amount: totalCharged,
        network: getCdpNetworkName(),
        useCdpPaymaster: true,
      });

      let hash: string;
      if (result.type === "evm-eoa") hash = result.transactionHash;
      else if (result.type === "evm-smart") hash = result.userOpHash;
      else hash = result.transactionSignature;

      if (publicClient && result.type === "evm-eoa") {
        await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });
      }

      // Retry confirmFunding up to 3 times with exponential backoff
      let res;
      let lastError: Error | null = null;
      const maxRetries = 3;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          res = await confirmFunding({
            giftCardId,
            data: { userId: backendUserId, walletAddress: user.evmAddress, txHash: hash },
          });
          break;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error("Unknown error");
          if (attempt < maxRetries - 1) {
            const delayMs = Math.pow(2, attempt) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }
      }

      if (!res) {
        throw lastError || new Error("Failed to confirm funding after retries");
      }

      const nextParams = new URLSearchParams({
        giftCardId,
        amount,
        message,
        ...(res.claimLink ? { claimLink: res.claimLink } : {}),
      });
      router.push(`/dashboard/send/success?${nextParams.toString()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setIsPayingWithBalance(false);
    }
  };

  const handleApplePay = async () => {
    // Apple Pay = CDP Onramp. We need to create a *new* gift card with ONRAMP payment method
    // which returns an onrampUrl. The user completes fiat payment there; the backend webhook
    // activates the gift card. We then poll /dashboard/send/processing for the terminal status.
    if (!user?.evmAddress || !backendUserId) {
      toast.error("Please sign in first");
      return;
    }
    setIsCreatingOnramp(true);
    try {
      const res = await createGiftCard({
        userId: backendUserId,
        walletAddress: user.evmAddress,
        amount: parseFloat(amount),
        personalMessage: message || undefined,
        recipientEmail: email || undefined,
        paymentMethod: PAYMENT_METHOD.ONRAMP,
      });

      if (res.onrampUrl) {
        // Store giftCardId for polling after the onramp redirect returns
        const processingParams = new URLSearchParams({
          giftCardId: res.giftCardId,
          amount,
          message,
        });
        // Append return URL so CDP Onramp redirects back to our processing page
        const returnUrl = `${window.location.origin}/dashboard/send/processing?${processingParams.toString()}`;
        window.location.href = `${res.onrampUrl}&redirectUrl=${encodeURIComponent(returnUrl)}`;
      } else {
        toast.error("Onramp URL not available");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to initiate Apple Pay");
    } finally {
      setIsCreatingOnramp(false);
    }
  };

  const handleExternalWallet = () => {
    const nextParams = new URLSearchParams({
      amount,
      message,
      giftCardId: giftCardId ?? "",
      treasuryAddress: treasuryAddress ?? "",
      totalCharged: totalCharged ?? "",
      userId: backendUserId ?? "",
    });
    router.push(`/dashboard/send/external?${nextParams.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-4rem)]">
      <AmountHeader amount={amount} message={message} />

      <div className="flex flex-col gap-3">
        {/* Pay via balance */}
        <button
          onClick={handlePayWithBalance}
          disabled={isPayingWithBalance}
          className="w-full h-14 rounded-2xl bg-[#1131FF] text-white tracking-tight text-base font-medium flex items-center justify-center gap-2 hover:bg-[#1131FF]/90 disabled:opacity-50 transition-colors"
        >
          {isPayingWithBalance ? (
            <>
              <Spinner className="size-4" />
              Processing...
            </>
          ) : (
            "Pay via your balance"
          )}
        </button>

        {/* Apple Pay / Onramp */}
        <button
          onClick={handleApplePay}
          disabled={isCreatingOnramp}
          className="w-full h-14 rounded-2xl bg-foreground text-background tracking-tight text-base font-medium flex items-center justify-center gap-2 hover:bg-foreground/90 disabled:opacity-50 transition-colors"
        >
          {isCreatingOnramp ? (
            <>
              <Spinner className="size-4" />
              Redirecting...
            </>
          ) : (
            "Pay with Apple Pay"
          )}
        </button>

        {/* External wallet */}
        <button
          onClick={handleExternalWallet}
          className="w-full h-14 rounded-2xl bg-background text-foreground tracking-tight text-base font-medium border border-border hover:bg-muted transition-colors"
        >
          Pay with External Wallet
        </button>
      </div>
    </div>
  );
}
