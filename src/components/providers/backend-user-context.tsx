"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useEnsureUserRegistered } from "@/hooks/use-ensure-user-registered";

interface BackendUserContextValue {
  backendUserId: string | null;
}

const BackendUserContext = createContext<BackendUserContextValue | null>(null);

export function BackendUserProvider({ children }: { children: ReactNode }) {
  const [backendUserId, setBackendUserId] = useState<string | null>(null);
  const handleRegistered = useCallback((id: string) => setBackendUserId(id), []);
  useEnsureUserRegistered({ onRegistered: handleRegistered });

  return (
    <BackendUserContext.Provider value={{ backendUserId }}>{children}</BackendUserContext.Provider>
  );
}

export function useBackendUser(): BackendUserContextValue {
  const ctx = useContext(BackendUserContext);
  if (!ctx) throw new Error("useBackendUser must be used within BackendUserProvider");
  return ctx;
}
