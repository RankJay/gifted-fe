"use client"

import { CDPReactProvider } from "@coinbase/cdp-react"
import { ReactNode } from "react"

interface CDPProviderProps {
  children: ReactNode
}

export function CDPProvider({ children }: CDPProviderProps) {
  const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID

  if (!projectId) {
    console.warn(
      "NEXT_PUBLIC_CDP_PROJECT_ID is not set. CDP authentication will not work."
    )
  }

  return (
    <CDPReactProvider
      config={{
        projectId: projectId || "",
        ethereum: {
          createOnLogin: "eoa",
        },
        appName: "Gifted",
      }}
    >
      {children}
    </CDPReactProvider>
  )
}
