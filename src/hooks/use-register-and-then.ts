"use client";

import { toast } from "sonner";
import { useRegisterUser } from "@/hooks/use-register-user";

interface RegisterableUser {
  userId: string;
  evmAddress: string | undefined;
  email: string | undefined;
}

const CONFLICT_INDICATORS = ["already exists", "conflict"];

export function useRegisterAndThen() {
  const { mutate: registerUser, isPending: isRegistering } = useRegisterUser();

  const registerAndThen = (
    user: RegisterableUser | null,
    action: () => void,
    options?: { signInMessage?: string; errorMessage?: string },
  ) => {
    if (!user?.userId || !user?.evmAddress || !user?.email) {
      toast.error(options?.signInMessage ?? "Please sign in with a wallet");
      return;
    }

    registerUser(
      { email: user.email, walletAddress: user.evmAddress },
      {
        onSuccess: action,
        onError: (err) => {
          const msg = (err.message ?? "").toLowerCase();
          const isConflict = CONFLICT_INDICATORS.some((ind) => msg.includes(ind));
          if (isConflict) {
            action();
          } else {
            toast.error(err.message ?? options?.errorMessage ?? "Failed to register user");
          }
        },
      },
    );
  };

  return { registerAndThen, isRegistering };
}
