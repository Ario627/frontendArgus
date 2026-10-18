import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchRoutes } from "@/features/routes/api/routes.api";
import type { RouteStatus } from "@/shared/constants/route.constant";
import { env } from "@/shared/lib/env";

export interface RouteFilterState {
  readonly tanggal?: string;
  readonly status?: RouteStatus;
}

const LIST_LIMIT = 50;

export function useRoutes(filters: RouteFilterState) {
  const query: RouteFilterState = {
    ...(filters.tanggal === undefined ? {} : { tanggal: filters.tanggal }),
    ...(filters.status === undefined ? {} : { status: filters.status })
  };

  return useQuery({
    queryKey: qk.routes.list(query),
    queryFn: () => fetchRoutes({ ...query, limit: LIST_LIMIT }),
    staleTime: 30_000,
    refetchInterval: env.VITE_POLL_OPERATIONAL_MS
  });
}