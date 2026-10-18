import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchFleetList, type FleetQuery } from "@/features/fleet/api/fleet.api";
import type { FleetStatus } from "@/shared/constants/fleet.constant";
import { env } from "@/shared/lib/env";

export interface FleetFilterState {
  readonly aktif?: boolean;
  readonly status?: FleetStatus;
}

const LIST_LIMIT = 100;

export function useFleetList(filters: FleetFilterState) {
  const query: Omit<FleetQuery, "page" | "limit"> = {
    ...(filters.aktif === undefined ? {} : { aktif: filters.aktif }),
    ...(filters.status === undefined ? {} : { status: filters.status })
  };

  return useQuery({
    queryKey: qk.fleet.list(query),
    queryFn: () => fetchFleetList({ ...query, limit: LIST_LIMIT }),
    staleTime: 15_000,
    refetchInterval: env.VITE_POLL_FLEET_MS
  });
}