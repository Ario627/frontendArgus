import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchRoutes, fetchRouteDetail } from "@/features/routes/api/routes.api";
import { env } from "@/shared/lib/env";
import { wibIsoDate } from "@/shared/lib/format";
import type { RoutePlanDto } from "@/shared/types/route.types";

const DRIVER_LIST_LIMIT = 20;

export interface DriverRouteState {
  readonly plan: RoutePlanDto | null;
  readonly listPending: boolean;
  readonly listError: unknown;
  readonly detail: ReturnType<typeof useRouteDetailQuery>;
  readonly refetch: () => void;
}

function useRouteDetailQuery(planId: string | null) {
  return useQuery({
    queryKey: qk.routes.detail(planId ?? "kosong"),
    queryFn: () => fetchRouteDetail(planId ?? ""),
    enabled: planId !== null,
    staleTime: 15_000,
    refetchInterval: env.VITE_POLL_OPERATIONAL_MS
  });
}

export function useDriverRoute(): DriverRouteState {
  const today = wibIsoDate(0);

  const list = useQuery({
    queryKey: qk.routes.list({ tanggal: today, limit: DRIVER_LIST_LIMIT }),
    queryFn: () => fetchRoutes({ tanggal: today, limit: DRIVER_LIST_LIMIT }),
    staleTime: 30_000,
    refetchInterval: env.VITE_POLL_OPERATIONAL_MS
  });

  const plan = useMemo(
    () => list.data?.items.find((entry) => entry.status === "AKTIF") ?? null,
    [list.data]
  );

  const detail = useRouteDetailQuery(plan?.id ?? null);

  return {
    plan,
    listPending: list.isPending,
    listError: list.error,
    detail,
    refetch: () => {
      void list.refetch();
      void detail.refetch();
    }
  };
}