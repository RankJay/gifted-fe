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
  const [isNavigatingExternal, setIsNavigatingExternal] = useState(false);

  const { amount, message, email, userId: urlUserId } = params;
  const backendUserId = urlUserId ?? contextUserId;

  const handlePayWithBalance = async () => {
    if (!user?.evmAddress || !backendUserId) {
      toast.error("Please sign in first");
      return;
    }
    setIsPayingWithBalance(true);
    try {
      const card = await createGiftCard({
        amount: parseFloat(amount),
        personalMessage: message || undefined,
        recipientEmail: email || undefined,
        paymentMethod: PAYMENT_METHOD.EOA_TRANSFER,
      });

      if (!card.treasuryAddress) {
        toast.error("Treasury address unavailable");
        return;
      }

      const result = await sendUsdc({
        from: user.evmAddress as `0x${string}`,
        to: card.treasuryAddress as `0x${string}`,
        amount: card.totalCharged,
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

      let res;
      let lastError: Error | null = null;
      for (let attempt = 0; attempt < 7; attempt++) {
        try {
          res = await confirmFunding({
            giftCardId: card.giftCardId,
            data: { txHash: hash },
          });
          break;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error("Unknown error");
          if (attempt < 2) await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
        }
      }

      if (!res) throw lastError ?? new Error("Failed to confirm funding");

      router.push(`/dashboard/send/success?giftCardId=${card.giftCardId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setIsPayingWithBalance(false);
    }
  };

  const handleApplePay = async () => {
    if (!user?.evmAddress || !backendUserId) {
      toast.error("Please sign in first");
      return;
    }
    setIsCreatingOnramp(true);
    try {
      const res = await createGiftCard({
        amount: parseFloat(amount),
        personalMessage: message || undefined,
        recipientEmail: email || undefined,
        paymentMethod: PAYMENT_METHOD.ONRAMP,
      });

      if (!res.onrampUrl) {
        toast.error("Onramp URL not available");
        return;
      }

      window.location.href = res.onrampUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to initiate Apple Pay");
    } finally {
      setIsCreatingOnramp(false);
    }
  };

  const handleExternalWallet = async () => {
    if (!user?.evmAddress || !backendUserId) {
      toast.error("Please sign in first");
      return;
    }
    setIsNavigatingExternal(true);
    try {
      const card = await createGiftCard({
        amount: parseFloat(amount),
        personalMessage: message || undefined,
        recipientEmail: email || undefined,
        paymentMethod: PAYMENT_METHOD.EOA_TRANSFER,
      });

      const nextParams = new URLSearchParams({
        giftCardId: card.giftCardId,
        treasuryAddress: card.treasuryAddress ?? "",
        totalCharged: card.totalCharged,
        userId: backendUserId,
        amount,
        message,
      });
      router.push(`/dashboard/send/external?${nextParams.toString()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to initiate payment");
    } finally {
      setIsNavigatingExternal(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-4rem)]">
      <AmountHeader amount={amount} message={message} />

      <div className="flex flex-col gap-3">
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

        <button
          onClick={handleExternalWallet}
          disabled={isNavigatingExternal}
          className="w-full h-14 rounded-2xl bg-background text-foreground tracking-tight text-base font-medium border border-border hover:bg-muted disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isNavigatingExternal ? (
            <>
              <Spinner className="size-4" />
              Loading...
            </>
          ) : (
            "Pay with External Wallet"
          )}
        </button>
      </div>
    </div>
  );
}
