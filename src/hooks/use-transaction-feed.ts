"use client";

import { useMemo } from "react";
import type { GiftCardSummary } from "@/lib/api/types";

export type FeedDirection = "sent" | "received";

export interface FeedItem extends GiftCardSummary {
  direction: FeedDirection;
}

export function useTransactionFeed(
  sent: GiftCardSummary[] | undefined,
  received: GiftCardSummary[] | undefined,
): FeedItem[] {
  return useMemo(() => {
    const sentItems: FeedItem[] = (sent ?? []).map((c) => ({ ...c, direction: "sent" }));
    const receivedItems: FeedItem[] = (received ?? []).map((c) => ({
      ...c,
      direction: "received",
    }));

    return [...sentItems, ...receivedItems].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [sent, received]);
}
