"use client";

import { useState } from "react";
import { useCdpAuth } from "@/hooks/use-cdp-auth";
import { PageLoader } from "@/components/layout/page-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { toast } from "sonner";
import { sendUsdc } from "@coinbase/cdp-core";
import { getCdpNetworkName } from "@/lib/constants";

function validateAddress(address: string, userAddress?: string): string | null {
  if (!address) return "Destination address is required";
  if (!address.startsWith("0x")) return "Address must start with 0x";
  if (address.length !== 42) return "Invalid address length";
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return "Invalid address format";
  if (userAddress && address.toLowerCase() === userAddress.toLowerCase()) {
    return "Cannot transfer to your own address";
  }
  return null;
}

function validateTransferAmount(amount: string): string | null {
  if (!amount) return "Amount is required";
  const num = parseFloat(amount);
  if (isNaN(num)) return "Invalid amount";
  if (num <= 0) return "Amount must be greater than 0";
  if (num > 1000000) return "Amount too large";
  const decimals = amount.split(".")[1];
  if (decimals && decimals.length > 6) return "Amount can have at most 6 decimal places";
  return null;
}

export default function TransferPage() {
  const { user, isLoading: authLoading } = useCdpAuth();
  const [amount, setAmount] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const amountError = amount ? validateTransferAmount(amount) : null;
  const addressError = destinationAddress
    ? validateAddress(destinationAddress, user?.evmAddress)
    : null;
  const canTransfer =
    !!amount &&
    !!destinationAddress &&
    !amountError &&
    !addressError &&
    !isTransferring &&
    !!user?.evmAddress;

  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canTransfer || !user?.evmAddress) return;

    setIsTransferring(true);
    setTxHash(null);

    try {
      const result = await sendUsdc({
        to: destinationAddress.trim() as `0x${string}`,
        amount: amount,
        network: getCdpNetworkName(),
        useCdpPaymaster: true,
      });

      let hash: string;
      if (result.type === "evm-eoa") {
        hash = result.transactionHash;
      } else if (result.type === "evm-smart") {
        hash = result.userOpHash;
      } else {
        hash = result.transactionSignature;
      }

      setTxHash(hash);
      toast.success(`Successfully transferred ${amount} USDC!`);
      setAmount("");
      setDestinationAddress("");
    } catch (error: any) {
      console.error("Transfer error:", error);
      toast.error(error?.message || "Failed to transfer USDC");
    } finally {
      setIsTransferring(false);
    }
  };

  if (authLoading) return <PageLoader />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 font-sans dark:bg-zinc-950">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Transfer USDC</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Transfer USDC from your wallet to another address
          </p>
        </div>

        <form onSubmit={handleTransfer}>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel>Amount (USDC)</FieldLabel>
                <FieldContent>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    aria-invalid={!!amountError}
                  />
                  <FieldError>{amountError}</FieldError>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>Destination Address</FieldLabel>
                <FieldContent>
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                    aria-invalid={!!addressError}
                  />
                  <FieldError>{addressError}</FieldError>
                </FieldContent>
              </Field>

              {txHash && (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-sm font-medium">Transaction Hash:</p>
                  <p className="mt-1 break-all font-mono text-xs text-muted-foreground">{txHash}</p>
                </div>
              )}

              <Button type="submit" disabled={!canTransfer} className="w-full">
                {isTransferring ? "Transferring..." : "Transfer USDC"}
              </Button>
            </FieldGroup>
          </FieldSet>
        </form>
      </div>
    </div>
  );
}
