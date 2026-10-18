import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchRecentLedgerEvents } from "@/features/ledger/api/ledger.api";
import { env } from "@/shared/lib/env";

export function useRecentLedgerEvents() {
  return useQuery({
    queryKey: qk.ledger.recent,
    queryFn: fetchRecentLedgerEvents,
    staleTime: 30_000,
    refetchInterval: env.VITE_POLL_OPERATIONAL_MS
  });
}