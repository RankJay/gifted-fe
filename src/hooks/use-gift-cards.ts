"use client"

import { useState, useEffect, useCallback } from "react"
import type { GiftCardResponse } from "@/lib/api"

const STORAGE_KEY = "gifted-gift-cards"

/**
 * Hook to manage gift cards stored in localStorage
 * Provides functions to save, retrieve, and manage gift cards
 */
export function useGiftCards() {
  const [giftCards, setGiftCards] = useState<GiftCardResponse[]>([])

  // Load gift cards from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as GiftCardResponse[]
        setGiftCards(parsed)
      }
    } catch (error) {
      console.error("Failed to load gift cards from localStorage:", error)
    }
  }, [])

  // Save gift cards to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(giftCards))
    } catch (error) {
      console.error("Failed to save gift cards to localStorage:", error)
    }
  }, [giftCards])

  const addGiftCard = useCallback((giftCard: GiftCardResponse) => {
    setGiftCards((prev) => [giftCard, ...prev])
  }, [])

  const removeGiftCard = useCallback((id: string) => {
    setGiftCards((prev) => prev.filter((card) => card.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setGiftCards([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    giftCards,
    addGiftCard,
    removeGiftCard,
    clearAll,
  }
}
