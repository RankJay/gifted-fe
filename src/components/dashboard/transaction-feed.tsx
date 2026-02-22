"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TransactionItem } from "./transaction-item";
import type { FeedItem } from "@/hooks/use-transaction-feed";

interface TransactionFeedProps {
  items: FeedItem[];
  isLoading: boolean;
}

function FeedSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Skeleton className="size-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-4 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

export function TransactionFeed({ items, isLoading }: TransactionFeedProps) {
  if (isLoading) return <FeedSkeleton />;

  if (items.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-[#8A8A8A]">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <TransactionItem key={`${item.direction}-${item.id}`} item={item} />
      ))}
    </div>
  );
}
