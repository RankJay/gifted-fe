"use client";

import { use } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Gift, Wallet } from "lucide-react";
import { formatDate } from "@/lib/format";
import { DashboardContext } from "./dashboard-context";

export function DashboardRedeem() {
  const context = use(DashboardContext);

  if (!context) {
    throw new Error("DashboardRedeem must be used within DashboardProvider");
  }

  const {
    state: { claimedGiftCards },
    actions: { setStep, handleRedeem },
    meta: { isRedeeming },
  } = context;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Redeem Gift Cards</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setStep("form")}>
            Back
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {claimedGiftCards.length === 0 ? (
          <Empty>
            <EmptyMedia variant="icon">
              <Wallet className="size-6" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No gift cards to redeem</EmptyTitle>
              <EmptyDescription>
                You don't have any claimed gift cards ready for redemption
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-4">
            {claimedGiftCards.map((card) => (
              <Card key={card.id} className="border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Gift className="size-5 text-primary" />
                        <span className="text-2xl font-bold">
                          ${parseFloat(card.amount).toFixed(2)}
                        </span>
                      </div>
                      {card.personalMessage && (
                        <p className="text-sm text-muted-foreground mt-2">{card.personalMessage}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Claimed on {card.claimedAt ? formatDate(card.claimedAt) : "N/A"}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleRedeem(card.id)}
                      disabled={isRedeeming}
                      className="gap-2"
                    >
                      {isRedeeming ? (
                        <>
                          <Spinner className="size-4" />
                          Redeeming...
                        </>
                      ) : (
                        <>
                          <Wallet className="size-4" />
                          Redeem
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
