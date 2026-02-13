"use client";

import { useCurrentUser } from "@coinbase/cdp-hooks";
import { useMemo } from "react";

/**
 * Hook to access CDP authentication information.
 *
 * Note: CDP doesn't expose the JWT token directly. Instead:
 * 1. Use the userId to authenticate with your backend
 * 2. Your backend can verify the user with CDP's API
 * 3. Your backend can then issue its own JWT token
 */
export function useCdpAuth() {
  const { currentUser } = useCurrentUser();

  const authInfo = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return {
      userId: currentUser.userId,
      isAuthenticated: true,
      evmAddress: currentUser.evmAccountObjects?.[0]?.address,
      solanaAddress: currentUser.solanaAccountObjects?.[0]?.address,
      email: currentUser.authenticationMethods?.email?.email,
    };
  }, [currentUser]);

  return {
    user: authInfo,
    isLoading: false,
    isAuthenticated: !!authInfo,
  };
}
