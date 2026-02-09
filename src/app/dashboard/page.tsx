"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { useCreateGiftCard } from "@/hooks/use-create-gift-card"
import { useGiftCards } from "@/hooks/use-gift-cards"
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
import { Copy, Check, Mail, Gift, Trash2, Calendar } from "lucide-react"

export default function DashboardPage() {
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()
  const successRef = useRef<HTMLDivElement>(null)
  const amountInputRef = useRef<HTMLInputElement>(null)

  const { mutate, isPending: isCreating, data, error } = useCreateGiftCard()
  const { giftCards, addGiftCard, removeGiftCard } = useGiftCards()

  // Focus management: Move focus to success message when shown
  useEffect(() => {
    if (showSuccess && successRef.current) {
      successRef.current.focus()
    }
  }, [showSuccess])

  // Validate amount
  const validateAmount = (value: string): string | null => {
    if (!value.trim()) {
      return "Amount is required"
    }
    const num = parseFloat(value)
    if (isNaN(num) || num <= 0) {
      return "Please enter a valid amount greater than 0"
    }
    return null
  }

  // Validate email format
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return null // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address"
    }
    return null
  }

  const amountError = amount ? validateAmount(amount) : null
  const emailError = recipientEmail ? validateEmail(recipientEmail) : null
  const canSubmit = amount && !amountError && !emailError && !isCreating

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!canSubmit) return

    startTransition(() => {
      mutate(
        {
          amount: amount.trim(),
          note: note.trim() || undefined,
          recipientEmail: recipientEmail.trim() || undefined,
        },
        {
          onSuccess: (giftCard) => {
            addGiftCard(giftCard)
            setShowSuccess(true)
            toast.success("Gift card created successfully!")
          },
          onError: (err) => {
            toast.error(err.message || "Failed to create gift card. Please try again.")
          },
        }
      )
    })
  }

  const handleCopyLink = async () => {
    if (!data?.claimLink) return

    try {
      await navigator.clipboard.writeText(data.claimLink)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy link. Please try again.")
    }
  }

  const handleCreateAnother = () => {
    setShowSuccess(false)
    setAmount("")
    setNote("")
    setRecipientEmail("")
    setCopied(false)
    // Focus on amount input
    setTimeout(() => {
      amountInputRef.current?.focus()
    }, 100)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const handleCopyFromSidebar = async (claimLink: string) => {
    try {
      await navigator.clipboard.writeText(claimLink)
      toast.success("Link copied to clipboard!")
    } catch (err) {
      toast.error("Failed to copy link. Please try again.")
    }
  }

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
                    <EmptyDescription>
                      Create your first gift card to see it here
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <SidebarMenu>
                  {giftCards.map((card) => (
                    <SidebarMenuItem key={card.id}>
                      <SidebarMenuButton
                        className="group relative flex flex-col items-start gap-1.5 p-3 h-auto"
                        onClick={() => handleCopyFromSidebar(card.claimLink)}
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Gift className="size-4 shrink-0 text-muted-foreground" />
                            <span className="font-medium truncate">
                              ${parseFloat(card.amount).toFixed(2)}
                            </span>
                            <Badge variant="outline" className="shrink-0">
                              {card.state}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex w-full items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="size-3" />
                          <span>{formatDate(card.createdAt)}</span>
                        </div>
                        <div className="w-full truncate text-xs text-muted-foreground font-mono">
                          {card.claimLink.split("/").pop()?.slice(0, 16)}...
                        </div>
                      </SidebarMenuButton>
                      <SidebarMenuAction
                        showOnHover
                        onClick={(e) => {
                          e.stopPropagation()
                          removeGiftCard(card.id)
                          toast.success("Gift card removed")
                        }}
                        aria-label="Remove gift card"
                      >
                        <Trash2 className="size-4" />
                      </SidebarMenuAction>
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
            <div className="mb-4 flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>
        {showSuccess && data ? (
          <Card
            ref={successRef}
            tabIndex={-1}
            aria-live="assertive"
            aria-label="Gift card created successfully"
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                <Gift className="size-8 text-primary" aria-hidden="true" />
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
                    value={data.claimLink}
                    className="font-mono text-sm"
                    aria-label="Claim link"
                  />
                  <Button
                    type="button"
                    onClick={handleCopyLink}
                    variant="outline"
                    size="icon"
                    aria-label={copied ? "Link copied" : "Copy link"}
                  >
                    {copied ? (
                      <Check className="size-4 text-green-600" aria-hidden="true" />
                    ) : (
                      <Copy className="size-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs">
                  Share this link privately with the recipient
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <FieldLabel htmlFor="share-email">Send via email (optional)</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    id="share-email"
                    type="email"
                    placeholder="recipient@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    aria-label="Recipient email"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (recipientEmail && validateEmail(recipientEmail) === null) {
                        toast.info("Email sharing will be available soon!")
                      } else {
                        toast.error("Please enter a valid email address")
                      }
                    }}
                    aria-label="Share via email"
                  >
                    <Mail className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button onClick={handleCreateAnother} variant="outline" className="w-full">
                Create Another Gift Card
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle className="text-2xl">Create Gift Card</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
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
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, "")
                          setAmount(value)
                        }}
                        aria-invalid={!!amountError}
                        aria-describedby={amountError ? "amount-error" : undefined}
                        className="pl-7"
                        disabled={isCreating || isPending}
                        required
                      />
                    </div>
                    {amountError ? (
                      <FieldError id="amount-error" role="alert">
                        {amountError}
                      </FieldError>
                    ) : null}
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="note">Note (optional)</FieldLabel>
                  <FieldContent>
                    <Textarea
                      id="note"
                      rows={4}
                      placeholder="Add a personal message..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      disabled={isCreating || isPending}
                      aria-describedby="note-description"
                    />
                    <p id="note-description" className="text-muted-foreground text-xs">
                      This message will be included with the gift card
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
                      disabled={isCreating || isPending}
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
                  disabled={!canSubmit || isCreating || isPending}
                  className="w-full"
                  aria-busy={isCreating || isPending}
                >
                  {isCreating || isPending ? (
                    <>
                      <Spinner className="mr-2" aria-hidden="true" />
                      Creating...
                    </>
                  ) : (
                    "Create Gift Card"
                  )}
                </Button>
              </CardFooter>
            </form>
            {error && (
              <div className="px-6 pb-6" role="alert" aria-live="polite">
                <FieldError>{error.message || "An error occurred. Please try again."}</FieldError>
              </div>
            )}
          </Card>
        )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
