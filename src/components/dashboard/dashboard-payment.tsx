"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Copy, Wallet, ExternalLink } from "lucide-react";
import { useRequiredDashboardContext } from "@/hooks/use-required-dashboard-context";
import { formatAmount } from "@/lib/format";

export function DashboardPayment() {
  const {
    state: { amount, txHash, initiatedGiftCard },
    actions: {
      setTxHash,
      setStep,
      handleCopyAddress,
      handleConfirmPayment,
      handlePayWithCdpWallet,
      handlePayWithExternalWallet,
    },
    meta: {
      isConfirming,
      isPayingWithCdp,
      isPayingWithExternal,
      canSubmitPayment,
      txHashError,
      cdpUsdcBalance,
      cdpUsdcBalanceLoading,
      externalWallet,
    },
  } = useRequiredDashboardContext();

  if (!initiatedGiftCard || !initiatedGiftCard.treasuryAddress) return null;

  const totalCharged = parseFloat(initiatedGiftCard.totalCharged);
  const cdpSufficient = parseFloat(cdpUsdcBalance) >= totalCharged;
  const externalSufficient = parseFloat(externalWallet.balance) >= totalCharged;
  const anyPaymentInProgress = isConfirming || isPayingWithCdp || isPayingWithExternal;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Send Payment</CardTitle>
      </CardHeader>
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
              <span className="font-semibold">${formatAmount(amount)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm">Fee:</span>
              <span className="font-semibold">${formatAmount(initiatedGiftCard.fee)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-lg">
                ${formatAmount(initiatedGiftCard.totalCharged)} USDC
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Option 1: CDP Wallet */}
        <div className="space-y-2">
          <FieldLabel className="flex items-center gap-2">
            <Wallet className="size-4" />
            Pay with your account
          </FieldLabel>
          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              {cdpUsdcBalanceLoading ? "Loading balance..." : `Balance: $${cdpUsdcBalance} USDC`}
            </p>
            <Button
              type="button"
              onClick={handlePayWithCdpWallet}
              disabled={cdpUsdcBalanceLoading || !cdpSufficient || anyPaymentInProgress}
              className="w-full"
            >
              {isPayingWithCdp ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Sending...
                </>
              ) : !cdpSufficient && !cdpUsdcBalanceLoading ? (
                "Insufficient balance"
              ) : (
                `Pay $${formatAmount(initiatedGiftCard.totalCharged)} USDC`
              )}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Option 2: External Wallet */}
        <div className="space-y-2">
          <FieldLabel className="flex items-center gap-2">
            <ExternalLink className="size-4" />
            Pay with external wallet
          </FieldLabel>
          <div className="rounded-lg border p-4 space-y-2">
            {!externalWallet.hasInjectedWallet ? (
              <p className="text-sm text-muted-foreground">
                No wallet detected. Install MetaMask or another Web3 wallet.
              </p>
            ) : !externalWallet.address ? (
              <>
                {externalWallet.connectError && (
                  <p className="text-sm text-destructive">{externalWallet.connectError}</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={externalWallet.connect}
                  disabled={externalWallet.isConnecting || anyPaymentInProgress}
                  className="w-full"
                >
                  {externalWallet.isConnecting ? (
                    <>
                      <Spinner className="mr-2 size-4" />
                      Connecting...
                    </>
                  ) : (
                    "Connect Wallet"
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {externalWallet.isBalanceLoading
                      ? "Loading..."
                      : `Balance: $${externalWallet.balance} USDC`}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={externalWallet.disconnect}
                    disabled={anyPaymentInProgress}
                  >
                    Disconnect
                  </Button>
                </div>
                <Button
                  type="button"
                  onClick={handlePayWithExternalWallet}
                  disabled={
                    externalWallet.isBalanceLoading || !externalSufficient || anyPaymentInProgress
                  }
                  className="w-full"
                >
                  {isPayingWithExternal ? (
                    <>
                      <Spinner className="mr-2 size-4" />
                      Sending...
                    </>
                  ) : !externalSufficient && !externalWallet.isBalanceLoading ? (
                    "Insufficient balance"
                  ) : (
                    `Pay $${formatAmount(initiatedGiftCard.totalCharged)} USDC`
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* Option 3: Manual paste */}
        <form onSubmit={handleConfirmPayment} className="space-y-2">
          <FieldLabel htmlFor="tx-hash">Or paste transaction hash</FieldLabel>
          <Field>
            <FieldContent>
              <Input
                id="tx-hash"
                type="text"
                placeholder="0x..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                aria-invalid={!!txHashError}
                aria-describedby={txHashError ? "tx-hash-error" : undefined}
                disabled={anyPaymentInProgress}
              />
              {txHashError ? (
                <FieldError id="tx-hash-error" role="alert">
                  {txHashError}
                </FieldError>
              ) : (
                <p className="text-muted-foreground text-xs mt-1">
                  Send USDC elsewhere and paste the tx hash here
                </p>
              )}
            </FieldContent>
          </Field>
          <Button
            type="submit"
            disabled={!canSubmitPayment || anyPaymentInProgress}
            variant="outline"
            className="w-full"
          >
            {isConfirming ? (
              <>
                <Spinner className="mr-2 size-4" />
                Confirming...
              </>
            ) : (
              "Confirm Payment"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep("form")}
          className="w-full"
          disabled={anyPaymentInProgress}
        >
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
