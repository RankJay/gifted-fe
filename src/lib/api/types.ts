export interface GiftCardSummary {
  id: string;
  amount: string;
  status: string;
  personalMessage: string | null;
  createdAt: string;
  claimedAt: string | null;
  redeemedAt: string | null;
  claimLink?: string | null;
  senderEmail?: string | null;
  senderWalletAddress?: string | null;
  recipientEmail?: string | null;
}
