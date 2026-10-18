import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchLedgerVerification } from "@/features/ledger/api/ledger.api";

export function useBatchVerification(batchId: string | undefined) {
  return useQuery({
    queryKey: qk.ledger.verify(batchId ?? "kosong"),
    queryFn: () => fetchLedgerVerification(batchId ?? ""),
    enabled: batchId !== undefined,
    staleTime: 0,
    retry: false
  });
}