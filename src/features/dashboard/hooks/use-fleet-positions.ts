import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../api/query-keys";
import { POLLING_INTERVALS } from "../../../shared/constants/polling.constant";
import { dashboardApi } from "../api/dashboard.api";

export function useFleetPositions() {
  return useQuery({
    queryKey: queryKeys.dashboard.fleetPositions,
    queryFn: () => dashboardApi.getFleetPositions(),
    refetchInterval: POLLING_INTERVALS.fleetPositions,
    staleTime: POLLING_INTERVALS.fleetPositions / 2,
    refetchOnWindowFocus: false,
  });
}
