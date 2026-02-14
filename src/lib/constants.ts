/**
 * Application-wide constants
 * Single source of truth for magic numbers and strings
 */

// Gift Card Amount Constraints
export const GIFT_CARD_AMOUNT = {
  MIN: 10,
  MAX: 100,
  MAX_DECIMAL_PLACES: 2,
} as const;

// Character Limits
export const CHARACTER_LIMITS = {
  PERSONAL_MESSAGE: 500,
} as const;

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  CLIPBOARD_FEEDBACK: 2000,
  FOCUS_DELAY: 100,
  API_REQUEST: 30000,
  API_RETRY_DELAY: 100,
} as const;

// API Configuration
export const API_CONFIG = {
  RETRY_COUNT: 3,
} as const;

// Validation Patterns
export const VALIDATION_PATTERNS = {
  CLAIM_SECRET: /^[a-fA-F0-9]{64}$/,
  TX_HASH: /^0x[a-fA-F0-9]{64}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Gift Card Status
export const GIFT_CARD_STATUS = {
  ACTIVE: "active",
  CLAIMED: "claimed",
  REDEEMED: "redeemed",
} as const;

export type GiftCardStatus = (typeof GIFT_CARD_STATUS)[keyof typeof GIFT_CARD_STATUS];

// Payment Methods
export const PAYMENT_METHOD = {
  ONRAMP: "onramp",
  EOA_TRANSFER: "eoa_transfer",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_URL as string;
export const CDP_PROJECT_ID: string = process.env.NEXT_PUBLIC_CDP_PROJECT_ID as string;

// Chain config for EOA transfer payment (align with backend NetworkId)
// NEXT_PUBLIC_CHAIN_NETWORK: "base-sepolia" | "base-mainnet"
export const CHAIN_NETWORK: string = process.env.NEXT_PUBLIC_CHAIN_NETWORK ?? "base-sepolia";

// USDC contract address on target chain (must match backend)
export const USDC_CONTRACT_ADDRESS: string = process.env
  .NEXT_PUBLIC_USDC_CONTRACT_ADDRESS as string;

// WalletConnect project ID (required for RainbowKit)
export const WALLETCONNECT_PROJECT_ID: string = process.env
  .NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string;

// Web3 Configuration
export const USDC_DECIMALS = 6;

// Helper: Get CDP network name from CHAIN_NETWORK
export function getCdpNetworkName(): "base" | "base-sepolia" {
  return CHAIN_NETWORK === "base-mainnet" ? "base" : "base-sepolia";
}
