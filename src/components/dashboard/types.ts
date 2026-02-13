import type { GiftCardSummary } from "@/lib/api/types";

export type DashboardStep = "form" | "payment" | "success" | "redeem";

export interface InitiatedGiftCard {
  giftCardId: string;
  treasuryAddress: string;
  totalCharged: string;
  fee: string;
}

export interface DashboardUser {
  userId: string;
  isAuthenticated: boolean;
  evmAddress: string | undefined;
  solanaAddress: string | undefined;
  email: string | undefined;
}

export interface DashboardState {
  step: DashboardStep;
  amount: string;
  personalMessage: string;
  recipientEmail: string;
  txHash: string;
  initiatedGiftCard: InitiatedGiftCard | null;
  claimLink: string | null;
  copied: boolean;
  giftCards: GiftCardSummary[];
  claimedGiftCards: GiftCardSummary[];
}

export interface DashboardActions {
  setStep: (step: DashboardStep) => void;
  setAmount: (amount: string) => void;
  setPersonalMessage: (message: string) => void;
  setRecipientEmail: (email: string) => void;
  setTxHash: (hash: string) => void;
  setInitiatedGiftCard: (card: InitiatedGiftCard | null) => void;
  setClaimLink: (link: string | null) => void;
  setCopied: (copied: boolean) => void;
  handleRegisterAndCreate: () => void;
  handleCreateGiftCard: () => void;
  handleSubmitForm: (e: React.FormEvent<HTMLFormElement>) => void;
  handleConfirmPayment: (e: React.FormEvent<HTMLFormElement>) => void;
  handleCopyLink: () => void;
  handleCopyAddress: () => void;
  handleCreateAnother: () => void;
  handleRedeem: (giftCardId: string) => void;
  refetchGiftCards: () => void;
}

export interface DashboardMeta {
  amountInputRef: React.RefObject<HTMLInputElement | null>;
  user: DashboardUser | null;
  isLoading: boolean;
  isRegistering: boolean;
  isCreating: boolean;
  isConfirming: boolean;
  isRedeeming: boolean;
  canSubmitForm: boolean;
  canSubmitPayment: boolean;
  amountError: string | null;
  emailError: string | null;
  txHashError: string | null;
}

export interface DashboardContextValue {
  state: DashboardState;
  actions: DashboardActions;
  meta: DashboardMeta;
}
