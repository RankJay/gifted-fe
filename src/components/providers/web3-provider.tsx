"use client";

import "@rainbow-me/rainbowkit/styles.css";
import dynamic from "next/dynamic";
import { type ReactNode } from "react";

const Web3Provider = dynamic(
  async () => {
    const { wagmiConfig } = await import("@/lib/wagmi-config");
    const { WagmiProvider } = await import("wagmi");
    const { RainbowKitProvider } = await import("@rainbow-me/rainbowkit");
    return {
      default: function Web3ProviderInner({ children }: { children: ReactNode }) {
        return (
          <WagmiProvider config={wagmiConfig}>
            <RainbowKitProvider>{children}</RainbowKitProvider>
          </WagmiProvider>
        );
      },
    };
  },
  { ssr: false },
);

export { Web3Provider };
