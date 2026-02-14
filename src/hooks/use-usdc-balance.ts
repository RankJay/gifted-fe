"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { erc20Abi } from "@/lib/abi/erc20";
import { CHAIN_NETWORK, USDC_CONTRACT_ADDRESS, USDC_DECIMALS } from "@/lib/constants";

const chain = CHAIN_NETWORK === "base-mainnet" ? base : baseSepolia;
const rpcUrl = chain.rpcUrls.default.http[0];

const publicClient = createPublicClient({
  chain,
  transport: http(rpcUrl),
});

export function useUsdcBalance(address: string | undefined) {
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address || !USDC_CONTRACT_ADDRESS?.startsWith("0x")) {
      setBalance("0");
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    publicClient
      .readContract({
        address: USDC_CONTRACT_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      })
      .then((raw) => {
        if (cancelled) return;
        const human = (Number(raw) / 10 ** USDC_DECIMALS).toFixed(2);
        setBalance(human);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
        setBalance("0");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [address]);

  return { balance, isLoading, error };
}
