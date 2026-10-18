import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchBatchDisposition } from "@/features/disposition/api/disposition.api";

export function useBatchDisposition(batchId: string | null) {
  return useQuery({
    queryKey: qk.batches.disposition(batchId ?? "kosong"),
    queryFn: () => fetchBatchDisposition(batchId ?? ""),
    enabled: batchId !== null,
    staleTime: 60_000
  });
}