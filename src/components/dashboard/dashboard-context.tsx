"use client";

import { createContext, type ReactNode } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import type { DashboardContextValue } from "./types";

export const DashboardContext = createContext<DashboardContextValue | null>(null);

export { type DashboardStep, type DashboardContextValue } from "./types";

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const value = useDashboard();
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
