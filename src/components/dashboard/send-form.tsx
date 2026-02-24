"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCdpAuth } from "@/hooks/use-cdp-auth";
import { useRegisterAndThen } from "@/hooks/use-register-and-then";
import { validateAmount, validateEmail } from "@/lib/validation";

export function SendForm() {
  const router = useRouter();
  const { user } = useCdpAuth();
  const { registerAndThen, isRegistering } = useRegisterAndThen();

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const amountError = amount ? validateAmount(amount) : null;
  const emailError = email ? validateEmail(email) : null;
  const canSubmit = !!amount && !amountError && !emailError && !isRegistering;

  const handleSubmit = () => {
    if (!canSubmit) return;

    registerAndThen(
      user,
      (bid) => {
        const params = new URLSearchParams({ amount, userId: bid });
        if (message.trim()) params.set("message", message.trim());
        if (email.trim()) params.set("email", email.trim());
        router.push(`/dashboard/send?${params.toString()}`);
      },
      { signInMessage: "Please sign in to send a gift card" },
    );
  };

  const isPending = isRegistering;

  return (
    <div className="flex flex-col gap-6">
      {/* Amount Input */}
      <div className="flex flex-col items-center">
        <div className="relative flex items-center justify-center">
          <input
            type="number"
            min="2"
            max="100"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full text-center text-7xl font-bold bg-transparent tracking-tighter border-none outline-none text-foreground placeholder:text-[#CCCCCC] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Gift card amount"
          />
        </div>
        <p className="text-xs h-1 font-medium tracking-tight text-rose-500">{amountError}</p>
      </div>

      {/* Message Input */}
      <div className="flex flex-col gap-1">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add message here"
          maxLength={500}
          className="w-full text-center font-medium tracking-tight bg-transparent border-none outline-none text-neutral-500 placeholder:text-[#CCCCCC] text-base"
          aria-label="Personal message"
        />
      </div>

      {/* Recipient Email */}
      <div className="flex flex-col gap-1">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Recipient email (optional)"
          className="w-full text-center font-medium tracking-tight bg-transparent border-none outline-none text-neutral-500 placeholder:text-[#CCCCCC] text-sm"
          aria-label="Recipient email"
        />
        <p className="text-xs h-1 font-medium text-center tracking-tight text-rose-500">
          {emailError}
        </p>
      </div>

      {/* CTA */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit || isPending}
        className="w-full h-14 rounded-2xl bg-foreground text-background text-base font-medium hover:bg-foreground/90 disabled:opacity-40"
      >
        {isPending ? (
          <>
            <Spinner className="mr-2" />
            Loading...
          </>
        ) : (
          "Send Gift Card"
        )}
      </Button>
    </div>
  );
}
