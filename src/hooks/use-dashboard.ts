"use client";

import { useState, useRef } from "react";
import { useCdpAuth } from "@/hooks/use-cdp-auth";
import { useCreateGiftCard } from "@/hooks/use-create-gift-card";
import { useConfirmEoaFunding } from "@/hooks/use-confirm-funding";
import { useRegisterAndThen } from "@/hooks/use-register-and-then";
import { useUserGiftCards } from "@/hooks/use-user-gift-cards";
import { useRedeemGiftCard } from "@/hooks/use-redeem-gift-card";
import { useUsdcBalance } from "@/hooks/use-usdc-balance";
import { useExternalWallet } from "@/hooks/use-external-wallet";
import { usePublicClient } from "wagmi";
import { toast } from "sonner";
import { sendUsdc } from "@coinbase/cdp-core";
import { validateAmount, validateEmail, validateTxHash } from "@/lib/validation";
import { formatAmount } from "@/lib/format";
import { GIFT_CARD_STATUS, PAYMENT_METHOD, TIMEOUTS, getCdpNetworkName } from "@/lib/constants";
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
  const [paymentMethod, setPaymentMethod] = useState<"onramp" | "eoa_transfer">("eoa_transfer");
  const [txHash, setTxHash] = useState("");
  const [initiatedGiftCard, setInitiatedGiftCard] = useState<InitiatedGiftCard | null>(null);
  const [claimLink, setClaimLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const { registerAndThen, isRegistering } = useRegisterAndThen();
  const { mutate: createGiftCard, isPending: isCreating } = useCreateGiftCard();
  const { mutateAsync: confirmFundingAsync, isPending: isConfirming } = useConfirmEoaFunding();
  const { mutate: redeemCard, isPending: isRedeeming } = useRedeemGiftCard();
  const { data: giftCardsData, refetch: refetchGiftCards } = useUserGiftCards(user?.userId ?? null);
  const { balance: cdpUsdcBalance, isLoading: cdpUsdcBalanceLoading } = useUsdcBalance(
    user?.evmAddress,
  );
  const externalWallet = useExternalWallet();
  const publicClient = usePublicClient();
  const [isPayingWithCdp, setIsPayingWithCdp] = useState(false);
  const [isPayingWithExternal, setIsPayingWithExternal] = useState(false);

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
        paymentMethod:
          paymentMethod === "onramp" ? PAYMENT_METHOD.ONRAMP : PAYMENT_METHOD.EOA_TRANSFER,
      },
      {
        onSuccess: (response) => {
          if (response.onrampUrl) {
            // Onramp flow: redirect to onramp URL
            setInitiatedGiftCard({
              giftCardId: response.giftCardId,
              onrampUrl: response.onrampUrl,
              totalCharged: response.totalCharged,
              fee: response.fee,
            });
            // Redirect to onramp URL - will redirect back to /create/success
            window.location.href = response.onrampUrl;
            toast.success("Redirecting to payment...");
          } else if (response.treasuryAddress) {
            // EOA transfer flow: show payment page
            setInitiatedGiftCard({
              giftCardId: response.giftCardId,
              treasuryAddress: response.treasuryAddress,
              totalCharged: response.totalCharged,
              fee: response.fee,
            });
            setStep("payment");
            toast.success("Gift card initiated. Please send payment.");
          } else {
            toast.error("Invalid response from server");
          }
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
    confirmFundingAsync({
      giftCardId: initiatedGiftCard.giftCardId,
      data: { userId: user.userId, walletAddress: user.evmAddress, txHash: txHash.trim() },
    })
      .then((response) => {
        setClaimLink(response.claimLink);
        setStep("success");
        void refetchGiftCards();
        toast.success("Payment confirmed! Gift card is ready.");
      })
      .catch((err) => toast.error(err.message || "Failed to confirm payment"));
  };

  const handlePayWithCdpWallet = async () => {
    if (!initiatedGiftCard || !user?.userId || !user?.evmAddress) return;
    if (parseFloat(cdpUsdcBalance) < parseFloat(initiatedGiftCard.totalCharged)) {
      toast.error("Insufficient USDC balance");
      return;
    }
    setIsPayingWithCdp(true);
    try {
      const result = await sendUsdc({
        to: initiatedGiftCard.treasuryAddress as `0x${string}`,
        amount: initiatedGiftCard.totalCharged,
        network: getCdpNetworkName(),
        useCdpPaymaster: true,
      });
      let hash: string;
      if (result.type === "evm-eoa") hash = result.transactionHash;
      else if (result.type === "evm-smart") hash = result.userOpHash;
      else hash = result.transactionSignature;

      if (publicClient && result.type === "evm-eoa") {
        await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });
      }

      const response = await confirmFundingAsync({
        giftCardId: initiatedGiftCard.giftCardId,
        data: { userId: user.userId, walletAddress: user.evmAddress, txHash: hash },
      });
      setClaimLink(response.claimLink);
      setStep("success");
      void refetchGiftCards();
      toast.success("Payment confirmed! Gift card is ready.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send payment");
    } finally {
      setIsPayingWithCdp(false);
    }
  };

  const handlePayWithExternalWallet = async () => {
    if (!initiatedGiftCard || !user?.userId || !user?.evmAddress || !externalWallet.address) return;
    if (parseFloat(externalWallet.balance) < parseFloat(initiatedGiftCard.totalCharged)) {
      toast.error("Insufficient USDC balance");
      return;
    }
    setIsPayingWithExternal(true);
    try {
      const hash = await externalWallet.sendUsdcTo(
        initiatedGiftCard.treasuryAddress,
        initiatedGiftCard.totalCharged,
      );
      const response = await confirmFundingAsync({
        giftCardId: initiatedGiftCard.giftCardId,
        data: {
          userId: user.userId,
          walletAddress: user.evmAddress,
          txHash: hash,
        },
      });
      setClaimLink(response.claimLink);
      setStep("success");
      void refetchGiftCards();
      toast.success("Payment confirmed! Gift card is ready.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send payment");
    } finally {
      setIsPayingWithExternal(false);
    }
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
    setPaymentMethod("eoa_transfer");
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
          void refetchGiftCards();
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
    paymentMethod,
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
    setPaymentMethod,
    setTxHash,
    setInitiatedGiftCard,
    setClaimLink,
    setCopied,
    handleRegisterAndCreate,
    handleCreateGiftCard,
    handleSubmitForm,
    handleConfirmPayment,
    handlePayWithCdpWallet,
    handlePayWithExternalWallet,
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
    isPayingWithCdp,
    isPayingWithExternal,
    canSubmitForm,
    canSubmitPayment,
    amountError,
    emailError,
    txHashError,
    cdpUsdcBalance: cdpUsdcBalance,
    cdpUsdcBalanceLoading,
    externalWallet: {
      address: externalWallet.address,
      balance: externalWallet.balance,
      isBalanceLoading: externalWallet.isBalanceLoading,
      isConnecting: externalWallet.isConnecting,
      isSending: externalWallet.isSending,
      hasInjectedWallet: externalWallet.hasInjectedWallet,
      connectError: externalWallet.connectError,
      connect: externalWallet.connect,
      disconnect: externalWallet.disconnect,
    },
  };

  return { state, actions, meta };
}
