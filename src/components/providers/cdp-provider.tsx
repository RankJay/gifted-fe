"use client";

import { CDPReactProvider } from "@coinbase/cdp-react";
import { ReactNode } from "react";
import { CDP_PROJECT_ID } from "@/lib/constants";

interface CDPProviderProps {
  children: ReactNode;
}

export function CDPProvider({ children }: CDPProviderProps) {
  return (
    <CDPReactProvider
      config={{
        projectId: CDP_PROJECT_ID,
        ethereum: {
          createOnLogin: "smart",
        },
        appName: "Gifted",
      }}
    >
      {children}
    </CDPReactProvider>
  );
}
