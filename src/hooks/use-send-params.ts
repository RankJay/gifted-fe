"use client";

import { useQueryStates, parseAsString } from "nuqs";

export function useSendParams() {
  return useQueryStates({
    amount: parseAsString.withDefault(""),
    message: parseAsString.withDefault(""),
    email: parseAsString.withDefault(""),
    giftCardId: parseAsString,
    userId: parseAsString,
    // only present when navigating to external wallet page
    treasuryAddress: parseAsString,
    totalCharged: parseAsString,
  });
}
