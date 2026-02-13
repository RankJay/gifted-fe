import { z } from "zod";
import { GIFT_CARD_AMOUNT, VALIDATION_PATTERNS } from "./constants";

/**
 * Validation schemas and utilities
 */

/**
 * Amount validation schema
 * Validates amount is between min and max with max decimal places
 */
export const amountSchema = z
  .string()
  .min(1, "Amount is required")
  .refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= GIFT_CARD_AMOUNT.MIN && num <= GIFT_CARD_AMOUNT.MAX;
    },
    {
      message: `Amount must be between $${GIFT_CARD_AMOUNT.MIN}.00 and $${GIFT_CARD_AMOUNT.MAX}.00`,
    },
  )
  .refine(
    (val) => {
      const decimals = val.split(".")[1];
      return !decimals || decimals.length <= GIFT_CARD_AMOUNT.MAX_DECIMAL_PLACES;
    },
    { message: `Amount can have at most ${GIFT_CARD_AMOUNT.MAX_DECIMAL_PLACES} decimal places` },
  );

/**
 * Email validation schema
 * Optional email - if provided, must be valid format
 */
export const emailSchema = z
  .string()
  .optional()
  .refine((val) => !val || VALIDATION_PATTERNS.EMAIL.test(val), {
    message: "Please enter a valid email address",
  });

/**
 * Transaction hash validation schema
 * Validates Ethereum transaction hash format (0x + 64 hex characters)
 */
export const txHashSchema = z
  .string()
  .min(1, "Transaction hash is required")
  .regex(VALIDATION_PATTERNS.TX_HASH, "Invalid transaction hash format");

/**
 * Validate amount
 * @param value Amount string to validate
 * @returns Error message or null if valid
 */
export function validateAmount(value: string): string | null {
  const result = amountSchema.safeParse(value);
  return result.success ? null : result.error.issues[0]?.message || "Invalid amount";
}

/**
 * Validate email
 * @param email Email string to validate (optional)
 * @returns Error message or null if valid
 */
export function validateEmail(email: string): string | null {
  const result = emailSchema.safeParse(email);
  return result.success ? null : result.error.issues[0]?.message || "Invalid email";
}

/**
 * Validate transaction hash
 * @param hash Transaction hash string to validate
 * @returns Error message or null if valid
 */
export function validateTxHash(hash: string): string | null {
  const result = txHashSchema.safeParse(hash.trim());
  return result.success ? null : result.error.issues[0]?.message || "Invalid transaction hash";
}
