"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useRequiredDashboardContext } from "@/hooks/use-required-dashboard-context";
import { CHARACTER_LIMITS, GIFT_CARD_AMOUNT } from "@/lib/constants";
import { getAmountRangeLabel } from "@/lib/format";

export function DashboardForm() {
  const {
    state: { amount, personalMessage, recipientEmail },
    actions: { setAmount, setPersonalMessage, setRecipientEmail, handleSubmitForm },
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
