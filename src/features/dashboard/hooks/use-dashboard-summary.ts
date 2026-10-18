import { useQuery } from "@tanstack/react-query";
import { fetchDashboardSummary } from "@/features/dashboard/api/dashboard.api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { qk } from "@/api/query-keys";
import { env } from "@/shared/lib/env";

export function useDashboardSummary() {
  const role = useAuthStore((state) => state.role);
  const sppgId = useAuthStore((state) => state.user?.sppgId ?? null);
  const scope = role === "sppg_staff" ? sppgId : null;
  const ready = role !== null && (role !== "sppg_staff" || sppgId !== null);

  return useQuery({
    queryKey: qk.dashboard.summary(scope),
    queryFn: () => fetchDashboardSummary(scope),
    enabled: ready,
    refetchInterval: env.VITE_POLL_OPERATIONAL_MS
  });
}