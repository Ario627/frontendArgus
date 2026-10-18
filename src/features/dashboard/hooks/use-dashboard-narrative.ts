import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchDashboardNarrative } from "@/features/dashboard/api/dashboard.api";

const NARRATIVE_STALE_MS = 60_000;
const PENDING_POLL_MIN_SECONDS = 3;
const PENDING_POLL_MAX_SECONDS = 30;

export function useDashboardNarrative(sppgId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: qk.dashboard.narrative(sppgId),
    queryFn: () => fetchDashboardNarrative({ sppgId }),
    enabled,
    staleTime: NARRATIVE_STALE_MS,
    retry: 1,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status !== "PENDING") return false;
      const seconds = data.retryAfterSeconds ?? PENDING_POLL_MIN_SECONDS;
      return Math.min(PENDING_POLL_MAX_SECONDS, Math.max(PENDING_POLL_MIN_SECONDS, seconds)) * 1000;
    }
  });
}
