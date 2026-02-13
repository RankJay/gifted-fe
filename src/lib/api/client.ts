/**
 * Effect-based API request client
 * Retry, timeout, abort, and correlation ID support
 */

import { Effect, Schedule, Duration } from "effect";
import { TIMEOUTS, API_CONFIG, API_BASE_URL } from "../constants";

interface ApiError {
  code: string;
  message: string;
}

export interface RequestOptions extends RequestInit {
  signal?: AbortSignal;
  correlationId?: string;
}

function createTimeoutSignal(timeoutMs: number): AbortSignal {
  if (typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(timeoutMs);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

function combineAbortSignals(signals: AbortSignal[]): AbortSignal {
  if (signals.length === 0) {
    const controller = new AbortController();
    return controller.signal;
  }
  if (signals.length === 1) return signals[0];
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any(signals);
  }
  const controller = new AbortController();
  signals.forEach((signal) => {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  });
  return controller.signal;
}

function apiRequestEffect<T>(endpoint: string, options?: RequestOptions): Effect.Effect<T, Error> {
  const url = `${API_BASE_URL}${endpoint}`;
  const correlationId = options?.correlationId ?? crypto.randomUUID();
  const timeoutSignal = createTimeoutSignal(TIMEOUTS.API_REQUEST);
  const abortSignals = options?.signal ? [options.signal, timeoutSignal] : [timeoutSignal];
  const combinedSignal = combineAbortSignals(abortSignals);

  return Effect.gen(function* (_) {
    const response = yield* _(
      Effect.tryPromise({
        try: () =>
          fetch(url, {
            ...options,
            signal: combinedSignal,
            headers: {
              "Content-Type": "application/json",
              "X-Request-ID": correlationId,
              ...options?.headers,
            },
          }),
        catch: (e) => (e instanceof Error ? e : new Error(String(e))),
      }),
    );

    if (!response.ok) {
      let errorMessage = `API request failed: ${response.statusText}`;
      const errorOption = yield* _(
        Effect.tryPromise({
          try: () => response.json() as Promise<ApiError>,
          catch: () => new Error("Failed to parse error response"),
        }).pipe(Effect.option),
      );
      if (errorOption._tag === "Some") {
        errorMessage = errorOption.value.message ?? errorMessage;
      }
      yield* _(Effect.fail(new Error(errorMessage)));
    }

    return yield* _(
      Effect.tryPromise({
        try: () => response.json() as Promise<T>,
        catch: (e) => (e instanceof Error ? e : new Error(`JSON parse failed: ${String(e)}`)),
      }),
    );
  }).pipe(
    Effect.timeout(Duration.millis(TIMEOUTS.API_REQUEST)),
    Effect.retry(
      Schedule.exponential(Duration.millis(TIMEOUTS.API_RETRY_DELAY)).pipe(
        Schedule.compose(Schedule.recurs(API_CONFIG.RETRY_COUNT)),
      ),
    ),
  );
}

export async function apiRequest<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  return Effect.runPromise(apiRequestEffect<T>(endpoint, options));
}
