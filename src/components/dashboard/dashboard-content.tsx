"use client";

import { AuthRedirect } from "@/components/auth/auth-redirect";
import { PageLoader } from "@/components/layout/page-loader";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useRequiredDashboardContext } from "@/hooks/use-required-dashboard-context";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardForm } from "./dashboard-form";
import { DashboardPayment } from "./dashboard-payment";
import { DashboardSuccess } from "./dashboard-success";
import { DashboardRedeem } from "./dashboard-redeem";

export function DashboardContent() {
  const {
    state: { step, claimedGiftCards },
    actions: { setStep },
    meta: { isLoading, user },
  } = useRequiredDashboardContext();

  if (isLoading) return <PageLoader />;
  if (!user?.userId || !user?.evmAddress) return <AuthRedirect />;

  const canRedeem = claimedGiftCards.length > 0;

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-50 via-white to-zinc-50 p-4 font-sans dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
          <div className="w-full max-w-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">Dashboard</h1>
              </div>
              {canRedeem && step === "form" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep("redeem")}
                  className="gap-2"
                >
                  <Wallet className="size-4" />
                  Redeem ({claimedGiftCards.length})
                </Button>
              )}
            </div>

            {step === "form" && <DashboardForm />}
            {step === "payment" && <DashboardPayment />}
            {step === "success" && <DashboardSuccess />}
            {step === "redeem" && <DashboardRedeem />}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
