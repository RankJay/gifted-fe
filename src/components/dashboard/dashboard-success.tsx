"use client";

import { use } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Gift, Copy, Check } from "lucide-react";
import { DashboardContext } from "./dashboard-context";

export function DashboardSuccess() {
  const context = use(DashboardContext);

  if (!context) {
    throw new Error("DashboardSuccess must be used within DashboardProvider");
  }

  const {
    state: { claimLink, copied },
    actions: { handleCopyLink, handleCreateAnother },
  } = context;

  if (!claimLink) return null;

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
          <Gift className="size-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Gift Card Created!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <FieldLabel htmlFor="claim-link">Share this link</FieldLabel>
          <div className="flex gap-2">
            <Input id="claim-link" readOnly value={claimLink} className="font-mono text-sm" />
            <Button
              type="button"
              onClick={handleCopyLink}
              variant="outline"
              size="icon"
              aria-label={copied ? "Link copied" : "Copy link"}
            >
              {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            Share this link privately with the recipient
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button onClick={handleCreateAnother} variant="outline" className="w-full">
          Create Another Gift Card
        </Button>
      </CardFooter>
    </Card>
  );
}
