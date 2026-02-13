"use client";

import { useState, useRef } from "react";
import { useCdpAuth } from "@/hooks/use-cdp-auth";
import { useCreateGiftCard } from "@/hooks/use-create-gift-card";
import { useConfirmEoaFunding } from "@/hooks/use-confirm-funding";
import { useRegisterAndThen } from "@/hooks/use-register-and-then";
import { useUserGiftCards } from "@/hooks/use-user-gift-cards";
import { useRedeemGiftCard } from "@/hooks/use-redeem-gift-card";
import { toast } from "sonner";
import { validateAmount, validateEmail, validateTxHash } from "@/lib/validation";
import { formatAmount } from "@/lib/format";
import { GIFT_CARD_STATUS, PAYMENT_METHOD, TIMEOUTS } from "@/lib/constants";
import type {
  DashboardContextValue,
  DashboardState,
  DashboardActions,
  DashboardMeta,
  DashboardStep,
  InitiatedGiftCard,
} from "@/components/dashboard/types";

export function useDashboard(): DashboardContextValue {
  const { user, isLoading: authLoading } = useCdpAuth();
  const [step, setStep] = useState<DashboardStep>("form");
  const [amount, setAmount] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [txHash, setTxHash] = useState("");
  const [initiatedGiftCard, setInitiatedGiftCard] = useState<InitiatedGiftCard | null>(null);
  const [claimLink, setClaimLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const { registerAndThen, isRegistering } = useRegisterAndThen();
  const { mutate: createGiftCard, isPending: isCreating } = useCreateGiftCard();
  const { mutate: confirmFunding, isPending: isConfirming } = useConfirmEoaFunding();
  const { mutate: redeemCard, isPending: isRedeeming } = useRedeemGiftCard();
  const { data: giftCardsData, refetch: refetchGiftCards } = useUserGiftCards(user?.userId ?? null);

  const giftCards = giftCardsData
    ? Array.from(
        new Map(
          [...giftCardsData.sent, ...giftCardsData.received].map((card) => [card.id, card]),
        ).values(),
      )
    : [];
  const claimedGiftCards = giftCards.filter((card) => card.status === GIFT_CARD_STATUS.CLAIMED);

  const amountError = amount ? validateAmount(amount) : null;
  const emailError = recipientEmail ? validateEmail(recipientEmail) : null;
  const txHashError = txHash ? validateTxHash(txHash) : null;
  const canSubmitForm = !!amount && !amountError && !emailError && !isCreating && !authLoading;
  const canSubmitPayment = !!txHash && !txHashError && !isConfirming && !!initiatedGiftCard;

  const handleRegisterAndCreate = () =>
    registerAndThen(user, handleCreateGiftCard, {
      signInMessage: "Please ensure you're signed in with a wallet address",
    });

  const handleCreateGiftCard = () => {
    if (!user?.userId || !user?.evmAddress) {
      toast.error("Please ensure you're signed in");
      return;
    }
    createGiftCard(
      {
        userId: user.userId,
        walletAddress: user.evmAddress,
        amount: parseFloat(amount),
        personalMessage: personalMessage.trim() || undefined,
        recipientEmail: recipientEmail.trim() || undefined,
        paymentMethod: PAYMENT_METHOD.EOA_TRANSFER,
      },
      {
        onSuccess: (response) => {
          if (!response.treasuryAddress) {
            toast.error("Treasury address not provided");
            return;
          }
          setInitiatedGiftCard({
            giftCardId: response.giftCardId,
            treasuryAddress: response.treasuryAddress,
            totalCharged: response.totalCharged,
            fee: response.fee,
          });
          setStep("payment");
          toast.success("Gift card initiated. Please send payment.");
        },
        onError: (err) => toast.error(err.message || "Failed to create gift card"),
      },
    );
  };

  const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmitForm) return;
    handleRegisterAndCreate();
  };

  const handleConfirmPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmitPayment || !initiatedGiftCard || !user?.userId || !user?.evmAddress) return;
    confirmFunding(
      {
        giftCardId: initiatedGiftCard.giftCardId,
        data: { userId: user.userId, walletAddress: user.evmAddress, txHash: txHash.trim() },
      },
      {
        onSuccess: (response) => {
          setClaimLink(response.claimLink);
          setStep("success");
          refetchGiftCards();
          toast.success("Payment confirmed! Gift card is ready.");
        },
        onError: (err) => toast.error(err.message || "Failed to confirm payment"),
      },
    );
  };

  const handleCopyLink = async () => {
    if (!claimLink) return;
    try {
      await navigator.clipboard.writeText(claimLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), TIMEOUTS.CLIPBOARD_FEEDBACK);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleCopyAddress = async () => {
    if (!initiatedGiftCard) return;
    try {
      await navigator.clipboard.writeText(initiatedGiftCard.treasuryAddress);
      toast.success("Address copied to clipboard!");
    } catch {
      toast.error("Failed to copy address");
    }
  };

  const handleCreateAnother = () => {
    setStep("form");
    setAmount("");
    setPersonalMessage("");
    setRecipientEmail("");
    setTxHash("");
    setInitiatedGiftCard(null);
    setClaimLink(null);
    setTimeout(() => amountInputRef.current?.focus(), TIMEOUTS.FOCUS_DELAY);
  };

  const handleRedeem = (giftCardId: string) => {
    if (!user?.userId || !user?.evmAddress) {
      toast.error("Please ensure you're signed in");
      return;
    }
    redeemCard(
      { giftCardId, data: { userId: user.userId, walletAddress: user.evmAddress } },
      {
        onSuccess: (response) => {
          toast.success(`Successfully redeemed $${formatAmount(response.amount)} USDC!`);
          refetchGiftCards();
          setStep("form");
        },
        onError: (err) => toast.error(err.message || "Failed to redeem gift card"),
      },
    );
  };

  const state: DashboardState = {
    step,
    amount,
    personalMessage,
    recipientEmail,
    txHash,
    initiatedGiftCard,
    claimLink,
    copied,
    giftCards,
    claimedGiftCards,
  };

  const actions: DashboardActions = {
    setStep,
    setAmount,
    setPersonalMessage,
    setRecipientEmail,
    setTxHash,
    setInitiatedGiftCard,
    setClaimLink,
    setCopied,
    handleRegisterAndCreate,
    handleCreateGiftCard,
    handleSubmitForm,
    handleConfirmPayment,
    handleCopyLink,
    handleCopyAddress,
    handleCreateAnother,
    handleRedeem,
    refetchGiftCards,
  };

  const meta: DashboardMeta = {
    amountInputRef,
    user,
    isLoading: authLoading,
    isRegistering,
    isCreating,
    isConfirming,
    isRedeeming,
    canSubmitForm,
    canSubmitPayment,
    amountError,
    emailError,
    txHashError,
  };

  return { state, actions, meta };
}
