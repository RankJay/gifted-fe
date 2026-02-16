"use client";

import { useEffect, useRef } from "react";
import { useCdpAuth } from "@/hooks/use-cdp-auth";
import { useRegisterUser } from "@/hooks/use-register-user";
import { validateEmail } from "@/lib/validation";

export interface UseEnsureUserRegisteredOptions {
  onRegistered?: (backendUserId: string) => void;
}

/**
 * Ensures authenticated user is registered in backend DB when they have valid email.
 * Runs once per user (by email+wallet) on dashboard entry. Backend register is idempotent.
 * Calls onRegistered with backend userId for use in API calls.
 */
export function useEnsureUserRegistered(options?: UseEnsureUserRegisteredOptions) {
  const { user } = useCdpAuth();
  const { mutate: registerUser } = useRegisterUser();
  const lastEnsured = useRef<string | null>(null);
  const onRegistered = options?.onRegistered;

  useEffect(() => {
    if (!user?.email || !user?.evmAddress) return;
    if (validateEmail(user.email) !== null) return;

    const key = `${user.email}:${user.evmAddress}`;
    if (lastEnsured.current === key) return;
    lastEnsured.current = key;

    registerUser(
      { email: user.email, walletAddress: user.evmAddress },
      {
        onSuccess: (res) => onRegistered?.(res.userId),
        onError: () => {
          lastEnsured.current = null;
        },
      },
    );
  }, [user?.email, user?.evmAddress, onRegistered, registerUser]);
}
