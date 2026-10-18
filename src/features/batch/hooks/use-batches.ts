import { useInfiniteQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchBatches, type BatchQuery } from "@/features/batch/api/batch.api";
import type { BatchStatus } from "@/shared/constants/batch.constant";
import type { WasteFlow } from "@/shared/constants/flow.constant";
import type { DispositionTier } from "@/shared/constants/tier.constant";
import { env } from "@/shared/lib/env";

export interface BatchFilterState {
  readonly status?: BatchStatus;
  readonly tier?: DispositionTier;
  readonly aliran?: WasteFlow;
}

const PAGE_LIMIT = 20;

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