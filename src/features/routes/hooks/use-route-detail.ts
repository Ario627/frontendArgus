import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchRouteDetail } from "@/features/routes/api/routes.api";
import { env } from "@/shared/lib/env";

export function useRouteDetail(planId: string | undefined) {
  return useQuery({
    queryKey: qk.routes.detail(planId ?? "kosong"),
    queryFn: () => fetchRouteDetail(planId ?? ""),
    enabled: planId !== undefined,
    staleTime: 15_000,
    refetchInterval: env.VITE_POLL_OPERATIONAL_MS
  });
}