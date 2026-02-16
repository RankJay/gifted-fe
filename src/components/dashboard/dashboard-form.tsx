"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useRequiredDashboardContext } from "@/hooks/use-required-dashboard-context";
import { CHARACTER_LIMITS, GIFT_CARD_AMOUNT } from "@/lib/constants";
import { getAmountRangeLabel } from "@/lib/format";
import { CreditCard, Wallet } from "lucide-react";

export function DashboardForm() {
  const {
    state: { amount, personalMessage, recipientEmail, paymentMethod },
    actions: { setAmount, setPersonalMessage, setRecipientEmail, setPaymentMethod, handleSubmitForm },
    meta: { amountInputRef, isCreating, isRegistering, canSubmitForm, amountError, emailError },
  } = useRequiredDashboardContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create Gift Card</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmitForm}>
        <CardContent className="space-y-6">
          <Field>
            <FieldLabel htmlFor="amount">
              Amount <span className="text-destructive">*</span>
            </FieldLabel>
            <FieldContent>
              <div className="relative">
                <span className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                  $
                </span>
                <Input
                  id="amount"
                  ref={amountInputRef}
                  type="text"
                  inputMode="decimal"
                  placeholder={`${GIFT_CARD_AMOUNT.MIN}.00`}
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "");
                    setAmount(value);
                  }}
                  aria-invalid={!!amountError}
                  aria-describedby={amountError ? "amount-error" : undefined}
                  className="pl-7"
                  disabled={isCreating || isRegistering}
                  required
                />
              </div>
              {amountError ? (
                <FieldError id="amount-error" role="alert">
                  {amountError}
                </FieldError>
              ) : (
                <p className="text-muted-foreground text-xs mt-1">
                  Amount must be between {getAmountRangeLabel()}
                </p>
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="note">Personal Message (optional)</FieldLabel>
            <FieldContent>
              <Textarea
                id="note"
                rows={4}
                placeholder="Add a personal message..."
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                disabled={isCreating || isRegistering}
                maxLength={CHARACTER_LIMITS.PERSONAL_MESSAGE}
              />
              <p className="text-muted-foreground text-xs mt-1">
                {personalMessage.length}/{CHARACTER_LIMITS.PERSONAL_MESSAGE} characters
              </p>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="recipient-email">Recipient Email (optional)</FieldLabel>
            <FieldContent>
              <Input
                id="recipient-email"
                type="email"
                placeholder="recipient@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
                disabled={isCreating || isRegistering}
              />
              {emailError ? (
                <FieldError id="email-error" role="alert">
                  {emailError}
                </FieldError>
              ) : null}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Payment Method</FieldLabel>
            <FieldContent>
              <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div
                  className={`flex flex-1 items-center gap-2 transition-opacity ${
                    paymentMethod === "eoa_transfer" ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <Wallet className="size-4 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Crypto Transfer</p>
                    <p className="text-xs text-muted-foreground">Send USDC from your wallet</p>
                  </div>
                </div>
                <Switch
                  checked={paymentMethod === "onramp"}
                  onCheckedChange={(checked) =>
                    setPaymentMethod(checked ? "onramp" : "eoa_transfer")
                  }
                  disabled={isCreating || isRegistering}
                  aria-label="Toggle payment method"
                />
                <div
                  className={`flex flex-1 items-center justify-end gap-2 transition-opacity ${
                    paymentMethod === "onramp" ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <div className="text-right">
                    <p className="text-sm font-medium">Onramp</p>
                    <p className="text-xs text-muted-foreground">Buy with card or bank</p>
                  </div>
                  <CreditCard className="size-4 shrink-0" />
                </div>
              </div>
            </FieldContent>
          </Field>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={!canSubmitForm || isCreating || isRegistering}
            className="w-full"
          >
            {isCreating || isRegistering ? (
              <>
                <Spinner className="mr-2" />
                Creating...
              </>
            ) : (
              "Create Gift Card"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
