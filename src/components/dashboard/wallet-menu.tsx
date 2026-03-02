"use client";

import { useSignOut } from "@coinbase/cdp-hooks";
import { useRouter } from "next/navigation";
import { LogOut, Copy, Check } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface WalletMenuProps {
  address?: string;
  ensName?: string;
  email?: string;
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function addressInitials(address: string) {
  return address.startsWith("0x") ? address.slice(2, 4).toUpperCase() : address.slice(0, 2).toUpperCase();
}

export function WalletMenu({ address, ensName, email }: WalletMenuProps) {
  const { signOut } = useSignOut();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  if (!address) return null;

  const displayLabel = `${address.slice(0, 8)}...`;
  const initials = addressInitials(email ?? address);

  async function handleSignOut() {
    await signOut();
    router.replace("/");
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(address!);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white p-1.5 text-sm font-medium text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 hover:shadow focus:outline-none">
          <Avatar size="sm" className="bg-[#1131FF]">
            <AvatarFallback className={`bg-[#1131FF] text-white text-[10px]! font-medium`}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="font-mono font-semibold mr-1 tracking-tighter text-sm">{displayLabel}</span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="center" sideOffset={8} className="w-64 shadow-xs rounded-2xl">
        {/* Identity row */}
        <div className="flex items-center gap-2 px-2 py-2">
          <Avatar className="bg-[#1131FF]">
            <AvatarFallback className="bg-[#1131FF] text-white text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col tracking-tight min-w-0">
            {ensName ? (
              <span className="text-sm font-semibold text-foreground truncate">{ensName}</span>
            ) : email ? (
              <span className="text-sm font-semibold text-foreground truncate">{email}</span>
            ) : null}
            <span className="text-xs text-neutral-400 font-mono truncate">
              {truncateAddress(address)}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Copy address */}
        <DropdownMenuItem
          className="cursor-pointer font-medium gap-2"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="size-4 text-emerald-500" />
          ) : (
            <Copy className="size-4" />
          )}
          <span>{copied ? "Copied!" : "Copy address"}</span>
        </DropdownMenuItem>

        {/* Sign out */}
        <DropdownMenuItem
          variant="destructive"
          className="rounded-b-xl cursor-pointer font-medium gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
