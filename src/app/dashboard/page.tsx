"use client"

import { useState, useRef, useEffect } from "react"
import { useCdpAuth } from "@/hooks/use-cdp-auth"
import { useCreateGiftCard } from "@/hooks/use-create-gift-card"
import { useConfirmEoaFunding } from "@/hooks/use-confirm-funding"
import { useRegisterUser } from "@/hooks/use-register-user"
import { useUserGiftCards } from "@/hooks/use-user-gift-cards"
import { useRedeemGiftCard } from "@/hooks/use-redeem-gift-card"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Copy, Check, Gift, Trash2, Calendar, ExternalLink, Wallet } from "lucide-react"

type Step = "form" | "payment" | "success" | "redeem"

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useCdpAuth()
  const [step, setStep] = useState<Step>("form")
  const [amount, setAmount] = useState("")
  const [personalMessage, setPersonalMessage] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [txHash, setTxHash] = useState("")
  const [initiatedGiftCard, setInitiatedGiftCard] = useState<{
    giftCardId: string
    treasuryAddress: string
    totalCharged: string
    fee: string
  } | null>(null)
  const [claimLink, setClaimLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const amountInputRef = useRef<HTMLInputElement>(null)

  const { mutate: registerUser, isPending: isRegistering } = useRegisterUser()
  const { mutate: createGiftCard, isPending: isCreating } = useCreateGiftCard()
  const { mutate: confirmFunding, isPending: isConfirming } = useConfirmEoaFunding()
  const { mutate: redeemCard, isPending: isRedeeming } = useRedeemGiftCard()
  const { data: giftCardsData, refetch: refetchGiftCards } = useUserGiftCards(user?.userId || null)

  // Validate amount
  const validateAmount = (value: string): string | null => {
    if (!value.trim()) {
      return "Amount is required"
    }
    const num = parseFloat(value)
    if (isNaN(num) || num < 10 || num > 100) {
      return "Amount must be between $10.00 and $100.00"
    }
    const decimals = value.split(".")[1]
    if (decimals && decimals.length > 2) {
      return "Amount can have at most 2 decimal places"
    }
    return null
  }

  // Validate email format
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address"
    }
    return null
  }

  // Validate transaction hash
  const validateTxHash = (hash: string): string | null => {
    if (!hash.trim()) {
      return "Transaction hash is required"
    }
    if (!/^0x[a-fA-F0-9]{64}$/.test(hash.trim())) {
      return "Invalid transaction hash format"
    }
    return null
  }

  const amountError = amount ? validateAmount(amount) : null
  const emailError = recipientEmail ? validateEmail(recipientEmail) : null
  const txHashError = txHash ? validateTxHash(txHash) : null
  const canSubmitForm = amount && !amountError && !emailError && !isCreating && !authLoading
  const canSubmitPayment = txHash && !txHashError && !isConfirming && initiatedGiftCard

  const handleRegisterAndCreate = async () => {
    if (!user?.userId || !user?.evmAddress || !user?.email) {
      toast.error("Please ensure you're signed in with a wallet address")
      return
    }

    // Register user first (backend returns existing user if already registered)
    registerUser(
      {
        email: user.email,
        walletAddress: user.evmAddress,
      },
      {
        onSuccess: () => {
          handleCreateGiftCard()
        },
        onError: (err) => {
          toast.error(err.message || "Failed to register user")
        },
      }
    )
  }

  const handleCreateGiftCard = () => {
    if (!user?.userId || !user?.evmAddress) {
      toast.error("Please ensure you're signed in")
      return
    }

    createGiftCard(
      {
        userId: user.userId,
        walletAddress: user.evmAddress,
        amount: parseFloat(amount),
        personalMessage: personalMessage.trim() || undefined,
        recipientEmail: recipientEmail.trim() || undefined,
        paymentMethod: "eoa_transfer",
      },
      {
        onSuccess: (response) => {
          if (!response.treasuryAddress) {
            toast.error("Treasury address not provided")
            return
          }
          setInitiatedGiftCard({
            giftCardId: response.giftCardId,
            treasuryAddress: response.treasuryAddress,
            totalCharged: response.totalCharged,
            fee: response.fee,
          })
          setStep("payment")
          toast.success("Gift card initiated. Please send payment.")
        },
        onError: (err) => {
          toast.error(err.message || "Failed to create gift card")
        },
      }
    )
  }

  const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSubmitForm) return
    handleRegisterAndCreate()
  }

  const handleConfirmPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSubmitPayment || !initiatedGiftCard || !user?.userId || !user?.evmAddress) return

    confirmFunding(
      {
        giftCardId: initiatedGiftCard.giftCardId,
        data: {
          userId: user.userId,
          walletAddress: user.evmAddress,
          txHash: txHash.trim(),
        },
      },
      {
        onSuccess: (response) => {
          setClaimLink(response.claimLink)
          setStep("success")
          refetchGiftCards()
          toast.success("Payment confirmed! Gift card is ready.")
        },
        onError: (err) => {
          toast.error(err.message || "Failed to confirm payment")
        },
      }
    )
  }

  const handleCopyLink = async () => {
    if (!claimLink) return
    try {
      await navigator.clipboard.writeText(claimLink)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy link")
    }
  }

  const handleCopyAddress = async () => {
    if (!initiatedGiftCard) return
    try {
      await navigator.clipboard.writeText(initiatedGiftCard.treasuryAddress)
      toast.success("Address copied to clipboard!")
    } catch (err) {
      toast.error("Failed to copy address")
    }
  }

  const handleCreateAnother = () => {
    setStep("form")
    setAmount("")
    setPersonalMessage("")
    setRecipientEmail("")
    setTxHash("")
    setInitiatedGiftCard(null)
    setClaimLink(null)
    setTimeout(() => {
      amountInputRef.current?.focus()
    }, 100)
  }

  const handleRedeem = (giftCardId: string) => {
    if (!user?.userId || !user?.evmAddress) {
      toast.error("Please ensure you're signed in")
      return
    }

    redeemCard(
      {
        giftCardId,
        data: {
          userId: user.userId,
          walletAddress: user.evmAddress,
        },
      },
      {
        onSuccess: (response) => {
          toast.success(`Successfully redeemed $${response.amount} USDC!`)
          refetchGiftCards()
          setStep("form")
        },
        onError: (err) => {
          toast.error(err.message || "Failed to redeem gift card")
        },
      }
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!user?.userId || !user?.evmAddress) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Please sign in with a wallet to continue.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Deduplicate gift cards by ID in case a card appears in both sent and received
  const giftCards = giftCardsData
    ? Array.from(
        new Map([...giftCardsData.sent, ...giftCardsData.received].map((card) => [card.id, card])).values()
      )
    : []
  const claimedGiftCards = giftCards.filter((card) => card.status === "claimed")
  const canRedeem = claimedGiftCards.length > 0

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Gift className="size-5" />
            <span className="font-semibold">Gift Cards</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Your Gift Cards</SidebarGroupLabel>
            <SidebarGroupContent>
              {giftCards.length === 0 ? (
                <Empty className="border-0">
                  <EmptyMedia variant="icon">
                    <Gift className="size-6" />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>No gift cards yet</EmptyTitle>
                    <EmptyDescription>Create your first gift card to see it here</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <SidebarMenu>
                  {giftCards.map((card) => (
                    <SidebarMenuItem key={card.id}>
                      <SidebarMenuButton className="group relative flex flex-col items-start gap-1.5 p-3 h-auto">
                        <div className="flex w-full items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Gift className="size-4 shrink-0 text-muted-foreground" />
                            <span className="font-medium truncate">${parseFloat(card.amount).toFixed(2)}</span>
                            <Badge variant="outline" className="shrink-0">
                              {card.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex w-full items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="size-3" />
                          <span>{formatDate(card.createdAt)}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-50 via-white to-zinc-50 p-4 font-sans dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
          <div className="w-full max-w-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">Dashboard</h1>
              </div>
              {canRedeem && step === "form" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep("redeem")}
                  className="gap-2"
                >
                  <Wallet className="size-4" />
                  Redeem ({claimedGiftCards.length})
                </Button>
              )}
            </div>

            {step === "form" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Create Gift Card</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmitForm}>
                  <CardContent className="space-y-6">
                    <Field>
                      <FieldLabel htmlFor="amount">
                        Amount <span className="text-destructive">*</span>
                      </FieldLabel>
                      <FieldContent>
                        <div className="relative">
                          <span className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                            $
                          </span>
                          <Input
                            id="amount"
                            ref={amountInputRef}
                            type="text"
                            inputMode="decimal"
                            placeholder="10.00"
                            value={amount}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9.]/g, "")
                              setAmount(value)
                            }}
                            aria-invalid={!!amountError}
                            aria-describedby={amountError ? "amount-error" : undefined}
                            className="pl-7"
                            disabled={isCreating || isRegistering}
                            required
                          />
                        </div>
                        {amountError ? (
                          <FieldError id="amount-error" role="alert">
                            {amountError}
                          </FieldError>
                        ) : (
                          <p className="text-muted-foreground text-xs mt-1">
                            Amount must be between $10.00 and $100.00
                          </p>
                        )}
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="note">Personal Message (optional)</FieldLabel>
                      <FieldContent>
                        <Textarea
                          id="note"
                          rows={4}
                          placeholder="Add a personal message..."
                          value={personalMessage}
                          onChange={(e) => setPersonalMessage(e.target.value)}
                          disabled={isCreating || isRegistering}
                          maxLength={500}
                        />
                        <p className="text-muted-foreground text-xs mt-1">
                          {personalMessage.length}/500 characters
                        </p>
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="recipient-email">Recipient Email (optional)</FieldLabel>
                      <FieldContent>
                        <Input
                          id="recipient-email"
                          type="email"
                          placeholder="recipient@example.com"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          aria-invalid={!!emailError}
                          aria-describedby={emailError ? "email-error" : undefined}
                          disabled={isCreating || isRegistering}
                        />
                        {emailError ? (
                          <FieldError id="email-error" role="alert">
                            {emailError}
                          </FieldError>
                        ) : null}
                      </FieldContent>
                    </Field>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      disabled={!canSubmitForm || isCreating || isRegistering}
                      className="w-full"
                    >
                      {isCreating || isRegistering ? (
                        <>
                          <Spinner className="mr-2" />
                          Creating...
                        </>
                      ) : (
                        "Create Gift Card"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            )}

            {step === "payment" && initiatedGiftCard && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Send Payment</CardTitle>
                </CardHeader>
                <form onSubmit={handleConfirmPayment}>
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
                          <span className="font-semibold">${parseFloat(amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm">Fee:</span>
                          <span className="font-semibold">${initiatedGiftCard.fee}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total:</span>
                          <span className="font-bold text-lg">${initiatedGiftCard.totalCharged} USDC</span>
                        </div>
                      </div>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="tx-hash">
                        Transaction Hash <span className="text-destructive">*</span>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id="tx-hash"
                          type="text"
                          placeholder="0x..."
                          value={txHash}
                          onChange={(e) => setTxHash(e.target.value)}
                          aria-invalid={!!txHashError}
                          aria-describedby={txHashError ? "tx-hash-error" : undefined}
                          disabled={isConfirming}
                          required
                        />
                        {txHashError ? (
                          <FieldError id="tx-hash-error" role="alert">
                            {txHashError}
                          </FieldError>
                        ) : (
                          <p className="text-muted-foreground text-xs mt-1">
                            Enter the transaction hash after sending USDC to the treasury address
                          </p>
                        )}
                      </FieldContent>
                    </Field>
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                    <Button
                      type="submit"
                      disabled={!canSubmitPayment || isConfirming}
                      className="w-full"
                    >
                      {isConfirming ? (
                        <>
                          <Spinner className="mr-2" />
                          Confirming...
                        </>
                      ) : (
                        "Confirm Payment"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("form")}
                      className="w-full"
                      disabled={isConfirming}
                    >
                      Cancel
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            )}

            {step === "success" && claimLink && (
              <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                    <Gift className="size-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Gift Card Created!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <FieldLabel htmlFor="claim-link">Share this link</FieldLabel>
                    <div className="flex gap-2">
                      <Input
                        id="claim-link"
                        readOnly
                        value={claimLink}
                        className="font-mono text-sm"
                      />
                      <Button
                        type="button"
                        onClick={handleCopyLink}
                        variant="outline"
                        size="icon"
                        aria-label={copied ? "Link copied" : "Copy link"}
                      >
                        {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Share this link privately with the recipient
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button onClick={handleCreateAnother} variant="outline" className="w-full">
                    Create Another Gift Card
                  </Button>
                </CardFooter>
              </Card>
            )}

            {step === "redeem" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">Redeem Gift Cards</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setStep("form")}>
                      Back
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {claimedGiftCards.length === 0 ? (
                    <Empty>
                      <EmptyMedia variant="icon">
                        <Wallet className="size-6" />
                      </EmptyMedia>
                      <EmptyHeader>
                        <EmptyTitle>No gift cards to redeem</EmptyTitle>
                        <EmptyDescription>
                          You don't have any claimed gift cards ready for redemption
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <div className="space-y-4">
                      {claimedGiftCards.map((card) => (
                        <Card key={card.id} className="border">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Gift className="size-5 text-primary" />
                                  <span className="text-2xl font-bold">${parseFloat(card.amount).toFixed(2)}</span>
                                </div>
                                {card.personalMessage && (
                                  <p className="text-sm text-muted-foreground mt-2">
                                    {card.personalMessage}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  Claimed on {card.claimedAt ? formatDate(card.claimedAt) : "N/A"}
                                </p>
                              </div>
                              <Button
                                onClick={() => handleRedeem(card.id)}
                                disabled={isRedeeming}
                                className="gap-2"
                              >
                                {isRedeeming ? (
                                  <>
                                    <Spinner className="size-4" />
                                    Redeeming...
                                  </>
                                ) : (
                                  <>
                                    <Wallet className="size-4" />
                                    Redeem
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
