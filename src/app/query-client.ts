import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { isApiError, isRetryableError } from "@/api/api-error";
import { logError } from "@/shared/lib/logger";

const QUERY_STALE_MS = 30_000;
const QUERY_GC_MS = 24 * 60 * 60 * 1000;
const MAX_QUERY_RETRIES = 2;

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  return failureCount < MAX_QUERY_RETRIES && isRetryableError(error);
}

function isUnexpectedFailure(error: unknown): boolean {
  if (!isApiError(error)) return true;
  return error.status === 0 || error.status >= 500;
}

function logFailure(scope: string, error: unknown): void {
  if (!isUnexpectedFailure(error)) return;
  if (isApiError(error)) {
    logError("query", `${scope}: ${error.code}`, { status: error.status, method: error.method ?? "" });
    return;
  }
  logError("query", `${scope}: UNKNOWN`);
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      logFailure(String(query.queryKey[0] ?? "query"), error);
    }
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      logFailure(String(mutation.options.mutationKey?.[0] ?? "mutation"), error);
    }
  }),
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_MS,
      gcTime: QUERY_GC_MS,
      retry: shouldRetryQuery,
      refetchOnWindowFocus: true,
      networkMode: "offlineFirst"
    },
    mutations: {
      retry: false,
      networkMode: "offlineFirst"
    }
  }
});