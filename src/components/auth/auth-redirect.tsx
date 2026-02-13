"use client";

import { useRedirect } from "@/hooks/use-redirect";

interface AuthRedirectProps {
  to?: string;
}

export function AuthRedirect({ to = "/" }: AuthRedirectProps) {
  useRedirect(to);
  return null;
}
