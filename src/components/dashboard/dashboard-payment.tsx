"use client";

import { use } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { Copy } from "lucide-react";
import { DashboardContext } from "./dashboard-context";

export function DashboardPayment() {
  const context = use(DashboardContext);

  if (!context) {
    throw new Error("DashboardPayment must be used within DashboardProvider");
  }

  const {
    state: { amount, txHash, initiatedGiftCard },
    actions: { setTxHash, setStep, handleCopyAddress, handleConfirmPayment },
    meta: { isConfirming, canSubmitPayment, txHashError },
  } = context;

  if (!initiatedGiftCard) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Send Payment</CardTitle>
      </CardHeader>
      <form onSubmit={handleConfirmPayment}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <FieldLabel>Send to Treasury Address</FieldLabel>
            <div className="flex gap-2">
              <Input
                readOnly
                value={initiatedGiftCard.treasuryAddress}
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyAddress}
                aria-label="Copy address"
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Amount to Send</FieldLabel>
            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Amount:</span>
                <span className="font-semibold">${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm">Fee:</span>
                <span className="font-semibold">${initiatedGiftCard.fee}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg">${initiatedGiftCard.totalCharged} USDC</span>
              </div>
            </div>
          </div>

          <Field>
            <FieldLabel htmlFor="tx-hash">
              Transaction Hash <span className="text-destructive">*</span>
            </FieldLabel>
            <FieldContent>
              <Input
                id="tx-hash"
                type="text"
                placeholder="0x..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                aria-invalid={!!txHashError}
                aria-describedby={txHashError ? "tx-hash-error" : undefined}
                disabled={isConfirming}
                required
              />
              {txHashError ? (
                <FieldError id="tx-hash-error" role="alert">
                  {txHashError}
                </FieldError>
              ) : (
                <p className="text-muted-foreground text-xs mt-1">
                  Enter the transaction hash after sending USDC to the treasury address
                </p>
              )}
            </FieldContent>
          </Field>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" disabled={!canSubmitPayment || isConfirming} className="w-full">
            {isConfirming ? (
              <>
                <Spinner className="mr-2" />
                Confirming...
              </>
            ) : (
              "Confirm Payment"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep("form")}
            className="w-full"
            disabled={isConfirming}
          >
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
