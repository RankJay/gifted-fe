"use client";

import { use } from "react";
import { DashboardContext } from "@/components/dashboard/dashboard-context";
import type { DashboardContextValue } from "@/components/dashboard/types";

export function useRequiredDashboardContext(): DashboardContextValue {
  const context = use(DashboardContext);
  if (!context) {
    throw new Error("Must be used within DashboardProvider");
  }
  return context;
}
