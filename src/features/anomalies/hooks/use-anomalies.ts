import { useInfiniteQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchAnomalies, type AnomalyQuery } from "@/features/anomalies/api/anomalies.api";
import type { AnomalyKind, AnomalySeverity } from "@/shared/constants/anomaly.constant";
import { env } from "@/shared/lib/env";

export interface AnomalyFilterState {
  readonly jenis?: AnomalyKind;
  readonly tingkat?: AnomalySeverity;
  readonly terbuka: boolean;
}

const PAGE_LIMIT = 20;

export function useAnomalies(filters: AnomalyFilterState) {
  const baseQuery: Omit<AnomalyQuery, "page" | "limit"> = {
    terbuka: filters.terbuka,
    ...(filters.jenis === undefined ? {} : { jenis: filters.jenis }),
    ...(filters.tingkat === undefined ? {} : { tingkat: filters.tingkat })
  };

  return useInfiniteQuery({
    queryKey: qk.anomalies.list(baseQuery),
    queryFn: ({ pageParam }) => fetchAnomalies({ ...baseQuery, page: pageParam, limit: PAGE_LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.items.length, 0);
      return loaded < lastPage.total ? pages.length + 1 : undefined;
    },
    staleTime: 30_000,
    refetchInterval: env.VITE_POLL_OPERATIONAL_MS
  });
}
