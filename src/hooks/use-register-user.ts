"use client";

import { useMutation } from "@tanstack/react-query";
import { registerUser, type RegisterRequest, type RegisterResponse } from "@/lib/api/user";

/**
 * React Query hook for registering a user
 */
export function useRegisterUser() {
  return useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: registerUser,
  });
}
