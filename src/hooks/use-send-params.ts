"use client";

import { useQueryStates, parseAsString } from "nuqs";

export function useSendParams() {
  return useQueryStates({
    amount: parseAsString.withDefault(""),
    message: parseAsString.withDefault(""),
    email: parseAsString.withDefault(""),
    giftCardId: parseAsString,
    method: parseAsString,
    treasuryAddress: parseAsString,
    // totalCharged = amount + fee, this is what must be sent on-chain
    totalCharged: parseAsString,
    claimLink: parseAsString,
    userId: parseAsString,
  });
}
