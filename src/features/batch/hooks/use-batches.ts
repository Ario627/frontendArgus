import { useInfiniteQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchBatches, type BatchQuery } from "@/features/batch/api/batch.api";
import { BATCH_STATUSES, type BatchStatus } from "@/shared/constants/batch.constant";
import { WASTE_FLOWS, type WasteFlow } from "@/shared/constants/flow.constant";
import { DISPOSITION_TIERS, type DispositionTier } from "@/shared/constants/tier.constant";
import { env } from "@/shared/lib/env";

export interface BatchFilterState {
  readonly status?: BatchStatus;
  readonly tier?: DispositionTier;
  readonly aliran?: WasteFlow;
}

const PAGE_LIMIT = 20;

export function readBatchFilters(params: URLSearchParams): BatchFilterState {
  const status = params.get("status") ?? "";
  const tier = params.get("tier") ?? "";
  const aliran = params.get("aliran") ?? "";
  return {
    ...(BATCH_STATUSES.includes(status as BatchStatus) ? { status: status as BatchStatus } : {}),
    ...(DISPOSITION_TIERS.includes(tier as DispositionTier) ? { tier: tier as DispositionTier } : {}),
    ...(WASTE_FLOWS.includes(aliran as WasteFlow) ? { aliran: aliran as WasteFlow } : {})
  };
}

export function writeBatchFilters(filters: BatchFilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.status !== undefined) params.set("status", filters.status);
  if (filters.tier !== undefined) params.set("tier", filters.tier);
  if (filters.aliran !== undefined) params.set("aliran", filters.aliran);
  return params;
}

export function useBatches(filters: BatchFilterState, sppgId: string | null) {
  const baseQuery: Omit<BatchQuery, "cursor" | "limit"> = {
    ...(sppgId === null ? {} : { sppgId }),
    ...(filters.status === undefined ? {} : { status: filters.status }),
    ...(filters.tier === undefined ? {} : { tier: filters.tier }),
    ...(filters.aliran === undefined ? {} : { aliran: filters.aliran })
  };

  return useInfiniteQuery({
    queryKey: qk.batches.list({ ...filters, ...(sppgId === null ? {} : { sppgId }) }),
    queryFn: ({ pageParam }) =>
      fetchBatches({
        ...baseQuery,
        ...(pageParam === "" ? {} : { cursor: pageParam }),
        limit: PAGE_LIMIT
      }),
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
    refetchInterval: env.VITE_POLL_OPERATIONAL_MS
  });
}