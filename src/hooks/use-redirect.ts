"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useRedirect(to: string) {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [router, to]);
}
