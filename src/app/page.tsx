"use client";

import { Logo } from "@/components/icons/logo-b";
import { AuthButton } from "@coinbase/cdp-react/components/AuthButton";
import { useCdpAuth } from "@/hooks/use-cdp-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated } = useCdpAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex flex-col items-center gap-8">
        <Logo width={150} height={150} />
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-semibold">Welcome to Gifted</h1>
          <p className="text-muted-foreground text-center text-sm">
            Sign in to create and manage your gift cards
          </p>
          <AuthButton />
        </div>
      </main>
    </div>
  );
}
