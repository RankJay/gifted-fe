"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatAmount, truncateAddress } from "@/lib/format";
import { useCdpAuth } from "@/hooks/use-cdp-auth";
import { useBackendUser } from "@/components/providers/backend-user-context";
import { useRedeemGiftCard } from "@/hooks/use-redeem-gift-card";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FeedItem } from "@/hooks/use-transaction-feed";

interface TransactionItemProps {
  item: FeedItem;
}

export function TransactionItem({ item }: TransactionItemProps) {
  const router = useRouter();
  const { user } = useCdpAuth();
  const { backendUserId } = useBackendUser();
  const queryClient = useQueryClient();
  const { mutate: redeemCard, isPending: isRedeeming } = useRedeemGiftCard();

  const isSent = item.direction === "sent";
  const isPendingPayment = item.status === "pending_payment";
  const isClaimed = item.status === "claimed";

  const counterparty = isSent
    ? (item.recipientEmail ?? "Unknown recipient")
    : item.senderWalletAddress
      ? truncateAddress(item.senderWalletAddress)
      : (item.senderEmail ?? "Unknown sender");

  const handleResumePay = () => {
    const params = new URLSearchParams({
      amount: item.amount,
      message: item.personalMessage ?? "",
      giftCardId: item.id,
    });
    router.push(`/dashboard/send?${params.toString()}`);
  };

  const handleRedeem = () => {
    if (!backendUserId || !user?.evmAddress) {
      toast.error("Please sign in to redeem");
      return;
    }
    redeemCard(
      { giftCardId: item.id, data: { userId: backendUserId, walletAddress: user.evmAddress } },
      {
        onSuccess: (res) => {
          toast.success(`Redeemed $${formatAmount(res.amount)} USDC`);
          void queryClient.invalidateQueries({ queryKey: ["user-gift-cards"] });
          void queryClient.invalidateQueries({ queryKey: ["usdc-balance"] });
        },
        onError: (err) => toast.error(err.message || "Failed to redeem"),
      },
    );
  };

  return (
    <div className="flex items-center gap-3 py-3">
      {/* Direction icon */}
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
          isSent ? "bg-foreground" : "bg-[#1131FF]"
        }`}
      >
        {isSent ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.95234 14.8531L14.8494 4.95117"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14.8518 14.8505L14.8494 4.951L4.9499 4.95345"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            width="16"
            height="20"
            viewBox="0 0 17 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.5 1.5V15.5"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15.5 8.5L8.5 15.5L1.5 8.5"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.5 23.5C9.05228 23.5 9.5 23.0523 9.5 22.5C9.5 21.9477 9.05228 21.5 8.5 21.5C7.94772 21.5 7.5 21.9477 7.5 22.5C7.5 23.0523 7.94772 23.5 8.5 23.5Z"
              fill="white"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-400 font-medium tracking-tight capitalize">
          {isSent ? "Sent" : "Received"}
        </p>
        <p className="text-sm font-semibold tracking-tight truncate">{counterparty}</p>
      </div>

      {/* Amount or action */}
      <div className="shrink-0 flex items-center gap-2">
        {isSent && isPendingPayment ? (
          <Button
            size="sm"
            onClick={handleResumePay}
            className="rounded-2xl bg-foreground text-background tracking-tight px-4 text-sm font-medium"
          >
            Pay
          </Button>
        ) : !isSent && isClaimed ? (
          <Button
            size="sm"
            onClick={handleRedeem}
            disabled={isRedeeming}
            className="rounded-2xl bg-[#1131FF] text-white tracking-tight px-4 text-sm font-medium hover:bg-[#1131FF]/90"
          >
            {isRedeeming ? <Spinner className="size-3" /> : "Redeem"}
          </Button>
        ) : (
          <span
            className={`text-sm font-semibold tracking-tighter ${isSent ? "text-neutral-400" : "text-emerald-600"}`}
          >
            {isSent ? "-" : "+"} {formatAmount(item.amount)} USDC
          </span>
        )}
      </div>
    </div>
  );
}
