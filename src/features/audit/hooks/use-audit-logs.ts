import { useInfiniteQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchAuditLogs, type AuditQuery } from "@/features/audit/api/audit.api";
import { env } from "@/shared/lib/env";

export interface AuditFilterState {
  readonly aksi?: string;
  readonly from?: string;
  readonly to?: string;
}

const PAGE_LIMIT = 25;

export function useAuditLogs(filters: AuditFilterState) {
  const baseQuery: Omit<AuditQuery, "page" | "limit"> = {
    ...(filters.aksi === undefined ? {} : { aksi: filters.aksi }),
    ...(filters.from === undefined ? {} : { from: filters.from }),
    ...(filters.to === undefined ? {} : { to: filters.to })
  };

  return useInfiniteQuery({
    queryKey: qk.audit.list(baseQuery),
    queryFn: ({ pageParam }) => fetchAuditLogs({ ...baseQuery, page: pageParam, limit: PAGE_LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.items.length, 0);
      return loaded < lastPage.total ? pages.length + 1 : undefined;
    },
    staleTime: 30_000,
    refetchInterval: env.VITE_POLL_OPERATIONAL_MS
  });
}
