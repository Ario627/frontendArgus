import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchBatchDetail } from "@/features/batch/api/batch.api";

export function useBatchDetail(batchId: string | undefined) {
  return useQuery({
    queryKey: qk.batches.detail(batchId ?? "kosong"),
    queryFn: () => fetchBatchDetail(batchId ?? ""),
    enabled: batchId !== undefined,
    staleTime: 15_000
  });
}