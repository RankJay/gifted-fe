"use client";

import { useCallback } from "react";
import { useAccount, useDisconnect, useSendTransaction } from "wagmi";
import { usePublicClient } from "wagmi";
import { encodeFunctionData, parseUnits } from "viem";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { erc20Abi } from "@/lib/abi/erc20";
import { USDC_CONTRACT_ADDRESS } from "@/lib/constants";
import { useUsdcBalance } from "./use-usdc-balance";

export function useExternalWallet() {
  const { address, isConnecting } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();

  const { balance, isLoading: isBalanceLoading } = useUsdcBalance(address ?? undefined);

  const { sendTransactionAsync, isPending: isSending } = useSendTransaction();

  const connect = useCallback(() => {
    openConnectModal?.();
  }, [openConnectModal]);

  const sendUsdcTo = useCallback(
    async (to: string, amountUsdc: string): Promise<string> => {
      if (!address || !USDC_CONTRACT_ADDRESS?.startsWith("0x"))
        throw new Error("Wallet not connected");
      if (!publicClient) throw new Error("RPC client not available");

      const amountRaw = parseUnits(amountUsdc, 6);
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [to as `0x${string}`, amountRaw],
      });

      const hash = await sendTransactionAsync({
        to: USDC_CONTRACT_ADDRESS as `0x${string}`,
        data,
      });

      if (!hash) throw new Error("Transaction failed");

      await publicClient.waitForTransactionReceipt({ hash });
      return hash;
    },
    [address, sendTransactionAsync, publicClient],
  );

  return {
    address: address ?? null,
    balance,
    isBalanceLoading,
    isConnecting,
    isSending,
    hasInjectedWallet: true,
    connectError: null,
    connect,
    disconnect,
    sendUsdcTo,
  };
}
