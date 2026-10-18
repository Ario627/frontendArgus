import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { isApiError } from "@/api/api-error";
import { fetchDispositionQueue } from "@/features/facility/api/incoming.api";
import type { BatchStatus } from "@/shared/constants/batch.constant";
import { env } from "@/shared/lib/env";
import { wibIsoDate } from "@/shared/lib/format";
import type { DispositionQueueItem } from "@/shared/types/disposition.types";

const ACTIVE_STATUSES: ReadonlySet<BatchStatus> = new Set(["DIANGKUT", "DITERIMA", "DIOLAH"]);

export function useIncomingBatches() {
  const today = wibIsoDate(0);
  const yesterday = wibIsoDate(1);

  const todayQuery = useQuery({
    queryKey: qk.dispositions({ date: today }),
    queryFn: () => fetchDispositionQueue(today),
    staleTime: 30_000,
    refetchInterval: env.VITE_POLL_OPERATIONAL_MS
  });

  const yesterdayQuery = useQuery({
    queryKey: qk.dispositions({ date: yesterday }),
    queryFn: () => fetchDispositionQueue(yesterday),
    staleTime: 5 * 60_000,
    refetchInterval: false
  });

  const items = useMemo(() => {
    const merged = new Map<string, DispositionQueueItem>();
    for (const item of [...(todayQuery.data ?? []), ...(yesterdayQuery.data ?? [])]) {
      if (!ACTIVE_STATUSES.has(item.status)) continue;
      if (!merged.has(item.batchId)) merged.set(item.batchId, item);
    }
    return [...merged.values()].sort((a, b) => b.ageHours - a.ageHours);
  }, [todayQuery.data, yesterdayQuery.data]);

  const error = isApiError(todayQuery.error)
    ? todayQuery.error
    : isApiError(yesterdayQuery.error)
      ? yesterdayQuery.error
      : null;

  const refetch = () => {
    void todayQuery.refetch();
    void yesterdayQuery.refetch();
  };

  return {
    items,
    isPending: todayQuery.isPending,
    isError: todayQuery.isError,
    error,
    refetch
  };
}