import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchLedgerEvents } from "@/features/ledger/api/ledger.api";

export function useLedgerEvents(batchId: string | undefined) {
  return useQuery({
    queryKey: qk.ledger.list(batchId ?? "kosong"),
    queryFn: () => fetchLedgerEvents(batchId ?? ""),
    enabled: batchId !== undefined,
    staleTime: 15_000
  });
}