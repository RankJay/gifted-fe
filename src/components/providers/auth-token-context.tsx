"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useCdpAuth } from "@/hooks/use-cdp-auth";
import { useBackendUser } from "./backend-user-context";
import { issueToken } from "@/lib/api/auth";

interface AuthTokenContextValue {
  token: string | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

const AuthTokenContext = createContext<AuthTokenContextValue | null>(null);

export function AuthTokenProvider({ children }: { children: ReactNode }) {
  const { user } = useCdpAuth();
  const { backendUserId } = useBackendUser();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchingRef = useRef(false);
  const lastCdpUserIdRef = useRef<string | null>(null);

  const fetchToken = useCallback(async (cdpUserId: string) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const res = await issueToken(cdpUserId);
      setToken(res.token);
      // Schedule a re-fetch 60 seconds before expiry
      const refreshIn = Math.max((res.expiresIn - 60) * 1000, 5000);
      setTimeout(() => {
        fetchingRef.current = false;
        fetchToken(cdpUserId);
      }, refreshIn);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to obtain auth token"));
      setToken(null);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Only fetch once both CDP user and backend user are ready,
    // and only when the cdpUserId changes.
    if (!user?.userId || !backendUserId) return;
    if (lastCdpUserIdRef.current === user.userId) return;
    lastCdpUserIdRef.current = user.userId;
    fetchToken(user.userId);
  }, [user?.userId, backendUserId, fetchToken]);

  // Clear token when user logs out
  useEffect(() => {
    if (!user?.userId) {
      setToken(null);
      setError(null);
      lastCdpUserIdRef.current = null;
    }
  }, [user?.userId]);

  const refresh = useCallback(() => {
    if (!user?.userId) return;
    fetchingRef.current = false;
    lastCdpUserIdRef.current = null;
    fetchToken(user.userId);
  }, [user?.userId, fetchToken]);

  return (
    <AuthTokenContext.Provider value={{ token, isLoading, error, refresh }}>
      {children}
    </AuthTokenContext.Provider>
  );
}

export function useAuthToken(): AuthTokenContextValue {
  const ctx = useContext(AuthTokenContext);
  if (!ctx) throw new Error("useAuthToken must be used within AuthTokenProvider");
  return ctx;
}
