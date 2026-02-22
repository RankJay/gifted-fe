"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { erc20Abi } from "@/lib/abi/erc20";
import { CHAIN_NETWORK, USDC_CONTRACT_ADDRESS, USDC_DECIMALS } from "@/lib/constants";

const chain = CHAIN_NETWORK === "base-mainnet" ? base : baseSepolia;

const publicClient = createPublicClient({
  chain,
  transport: http(chain.rpcUrls.default.http[0]),
});

async function fetchUsdcBalance(address: string): Promise<string> {
  const raw = await publicClient.readContract({
    address: USDC_CONTRACT_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
  });
  return (Number(raw) / 10 ** USDC_DECIMALS).toFixed(2);
}

export function useUsdcBalance(address: string | undefined) {
  const enabled = !!address && !!USDC_CONTRACT_ADDRESS?.startsWith("0x");

  const { data, isLoading, error } = useQuery({
    queryKey: ["usdc-balance", address],
    queryFn: () => fetchUsdcBalance(address!),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  return {
    balance: data ?? "0",
    isLoading,
    error: error as Error | null,
  };
}
