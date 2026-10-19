import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchDashboardImpact } from "@/features/dashboard/api/dashboard.api";

const IMPACT_STALE_MS = 60_000;

export function useDashboardImpact(sppgId: string | null) {
  return useQuery({
    queryKey: qk.dashboard.impact(sppgId),
    queryFn: () => fetchDashboardImpact(sppgId),
    staleTime: IMPACT_STALE_MS,
    retry: 1
  });
}
