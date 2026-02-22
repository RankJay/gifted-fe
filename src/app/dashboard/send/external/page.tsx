"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { AmountHeader } from "@/components/send/amount-header";
import { useSendParams } from "@/hooks/use-send-params";
import { useCdpAuth } from "@/hooks/use-cdp-auth";
import { useBackendUser } from "@/components/providers/backend-user-context";
import { useExternalWallet } from "@/hooks/use-external-wallet";
import { useConfirmEoaFunding } from "@/hooks/use-confirm-funding";
import { validateTxHash } from "@/lib/validation";

export default function ExternalWalletPage() {
  const router = useRouter();
  const { user } = useCdpAuth();
  const { backendUserId: contextUserId } = useBackendUser();
  const [params] = useSendParams();
  const { amount, message, giftCardId, treasuryAddress, totalCharged, userId: urlUserId } = params;
  const backendUserId = urlUserId ?? contextUserId;

  const externalWallet = useExternalWallet();
  const { mutateAsync: confirmFunding, isPending: isConfirming } = useConfirmEoaFunding();

  const [txHash, setTxHash] = useState("");
  const [isSending, setIsSending] = useState(false);

  const txHashError = txHash ? validateTxHash(txHash) : null;

  const handleConnectAndSend = async () => {
    if (!externalWallet.address) {
      externalWallet.connect();
      return;
    }
    if (!giftCardId || !treasuryAddress || !totalCharged || !user?.evmAddress || !backendUserId) {
      toast.error("Missing payment details");
      return;
    }
    setIsSending(true);
    try {
      // Send totalCharged (amount + fee) — backend verifies this exact amount on-chain
      const hash = await externalWallet.sendUsdcTo(treasuryAddress, totalCharged);
      const res = await confirmFunding({
        giftCardId,
        data: { userId: backendUserId, walletAddress: user.evmAddress, txHash: hash },
      });
      const nextParams = new URLSearchParams({
        giftCardId,
        amount,
        message,
        ...(res.claimLink ? { claimLink: res.claimLink } : {}),
      });
      router.push(`/dashboard/send/success?${nextParams.toString()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmManual = async () => {
    if (!giftCardId || !user?.evmAddress || !backendUserId || txHashError) return;
    try {
      const res = await confirmFunding({
        giftCardId,
        data: { userId: backendUserId, walletAddress: user.evmAddress, txHash: txHash.trim() },
      });
      const nextParams = new URLSearchParams({
        giftCardId,
        amount,
        message,
        ...(res.claimLink ? { claimLink: res.claimLink } : {}),
      });
      router.push(`/dashboard/send/success?${nextParams.toString()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to confirm transaction");
    }
  };

  const isPendingConnect = isSending || externalWallet.isSending;

  return (
    <div className="flex flex-col min-h-[calc(100dvh-4rem)]">
      <AmountHeader amount={amount} message={message} />

      <div className="flex flex-col gap-6">
        {/* Connect / Send button */}
        <button
          onClick={handleConnectAndSend}
          disabled={isPendingConnect}
          className="w-full h-14 rounded-2xl bg-foreground text-background text-base font-medium flex items-center justify-center gap-2 hover:bg-foreground/90 disabled:opacity-50 transition-colors"
        >
          {isPendingConnect ? (
            <>
              <Spinner className="size-4" />
              {externalWallet.address ? "Sending..." : "Connecting..."}
            </>
          ) : externalWallet.address ? (
            "Send from external wallet"
          ) : (
            "Connect external wallet"
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1" />
          <span className="text-xs text-neutral-400 font-medium tracking-wide">OR</span>
          <div className="flex-1 " />
        </div>

        {/* Manual paste */}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="Paste your transaction here..."
            className="w-full bg-transparent text-center text-sm text-foreground placeholder:text-[#CCCCCC] border-none outline-none"
            aria-label="Transaction hash"
          />
          {txHashError && txHash && (
            <p className="text-xs text-destructive text-center">{txHashError}</p>
          )}
          <button
            onClick={handleConfirmManual}
            disabled={!txHash || !!txHashError || isConfirming}
            className="w-full h-14 rounded-2xl bg-background text-foreground text-base font-medium tracking-tight border border-border flex items-center justify-center gap-2 hover:bg-muted disabled:opacity-40 transition-colors"
          >
            {isConfirming ? (
              <>
                <Spinner className="size-4" />
                Confirming...
              </>
            ) : (
              "Confirm transaction"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
