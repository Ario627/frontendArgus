import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../api/query-keys";
import { POLLING_INTERVALS } from "../../../shared/constants/polling.constant";
import { dashboardApi } from "../api/dashboard.api";

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: () => dashboardApi.getSummary(),
    refetchInterval: POLLING_INTERVALS.dashboardSummary,
    staleTime: POLLING_INTERVALS.dashboardSummary / 2,
    refetchOnWindowFocus: false,
  });
}
