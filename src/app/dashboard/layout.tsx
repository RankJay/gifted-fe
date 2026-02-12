"use client"

import { useIsSignedIn } from "@coinbase/cdp-hooks"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isSignedIn } = useIsSignedIn()
  const router = useRouter()

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/")
    }
  }, [isSignedIn, router])

  if (!isSignedIn) {
    return null
  }

  return <>{children}</>
}
