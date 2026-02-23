"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCdpAuth } from "@/hooks/use-cdp-auth";
import { useBackendUser } from "@/components/providers/backend-user-context";
import { useUsdcBalance } from "@/hooks/use-usdc-balance";
import { useUserGiftCards } from "@/hooks/use-user-gift-cards";
import { useTransactionFeed } from "@/hooks/use-transaction-feed";
import { BalanceDisplay } from "@/components/dashboard/balance-display";
import { SendForm } from "@/components/dashboard/send-form";
import { TransactionFeed } from "@/components/dashboard/transaction-feed";
import { PageContainer } from "@/components/layout/page-container";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useCdpAuth();
  const { backendUserId } = useBackendUser();

  useEffect(() => {
    if (!authLoading && !user?.userId) {
      router.replace("/");
    }
  }, [authLoading, user?.userId, router]);

  const { balance, isLoading: balanceLoading } = useUsdcBalance(user?.evmAddress);
  const { data: giftCardsData, isLoading: cardsLoading } = useUserGiftCards(backendUserId);
  const feedItems = useTransactionFeed(giftCardsData?.sent, giftCardsData?.received);

  return (
    <PageContainer>
      {/* Balance */}
      <BalanceDisplay balance={balance} isLoading={balanceLoading} />

      {/* Send form */}
      <SendForm />

      {/* Divider */}
      <div className="mt-8 mb-2" />

      {/* Transaction feed */}
      <TransactionFeed items={feedItems} isLoading={cardsLoading && !giftCardsData} />
    </PageContainer>
  );
}
