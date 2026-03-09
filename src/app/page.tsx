"use client";

import { SignInModal } from "@coinbase/cdp-react";
import { Logo } from "@/components/icons/logo-b";
import { AuthButton } from "@coinbase/cdp-react/components/AuthButton";
import { useCdpAuth } from "@/hooks/use-cdp-auth";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
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
    <div className="min-h-screen bg-[#F2F2F2]">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className="grid w-full gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.66fr)] lg:items-stretch lg:gap-4"
        >
          <section className="flex min-h-64 flex-col justify-between rounded-[1.75rem] border border-black/5 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-6 lg:aspect-square lg:min-h-0 lg:p-7">
            <Logo className="h-auto w-14 sm:w-16" />

            <div className="max-w-2xl">
              <div className="text-5xl font-medium tracking-[-0.05em] text-foreground">
                A gift card that finally feels like a gift.
              </div>
            </div>
          </section>

          <div className="grid gap-3 lg:grid-rows-[1fr_1fr] lg:gap-4">
            <section className="flex h-full flex-col justify-end rounded-[1.75rem] border border-black/5 bg-[#1131FF] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-6">
              <p className="text-sm font-medium text-blue-400">
                Personal and easy
              </p>
              <p className="mt-4 text-2xl font-medium tracking-tight text-white">
                Add a note, send with an email, and keep the whole experience delightful.
              </p>
            </section>

            <AuthButton
              className="h-full w-full"
              placeholder={() => (
                <div className="h-full w-full cursor-pointer animate-pulse rounded-[1.75rem] bg-neutral-200" />
              )}
              signInModal={({ open, setIsOpen, onSuccess }) => (
                <SignInModal open={open} setIsOpen={setIsOpen} onSuccess={onSuccess}>
                  <button
                    type="button"
                    className="group flex h-full w-full cursor-pointer flex-col justify-end rounded-[1.75rem] bg-foreground p-5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors hover:bg-foreground/92 sm:p-6"
                  >
                    <div className="flex w-full items-end justify-between gap-4">
                      <div>
                        <p className="max-w-xs text-sm font-medium tracking-tight text-neutral-500">
                          Sign in to create and manage gift cards.
                        </p>
                        <p className="mt-4 flex items-center gap-2 text-2xl font-medium tracking-tight text-white">
                          Start here
                        </p>
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-white transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                </SignInModal>
              )}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
