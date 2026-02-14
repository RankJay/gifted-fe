import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia } from "viem/chains";
import { http } from "viem";
import {
  CHAIN_NETWORK,
  WALLETCONNECT_PROJECT_ID,
} from "./constants";

const chains = CHAIN_NETWORK === "base-mainnet" ? [base] : [baseSepolia];
const chain = chains[0];
const rpcUrl = chain.rpcUrls.default.http[0];

export const wagmiConfig = getDefaultConfig({
  appName: "Gifted",
  projectId: WALLETCONNECT_PROJECT_ID ?? "",
  chains: chains as [typeof base, ...(typeof base)[]],
  transports: {
    [chain.id]: http(rpcUrl),
  },
  ssr: true,
});
