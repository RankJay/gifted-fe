import { API_BASE_URL } from "../constants";
import { ApiError } from "./client";

export interface TokenResponse {
  token: string;
  expiresIn: number;
}

// Does not use apiRequest because the token itself is not yet available
export async function issueToken(cdpUserId: string): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-ID": crypto.randomUUID(),
    },
    body: JSON.stringify({ cdpUserId }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { code?: string; message?: string };
    throw new ApiError(response.status, body.code ?? "UNKNOWN", body.message ?? response.statusText);
  }

  return response.json() as Promise<TokenResponse>;
}
