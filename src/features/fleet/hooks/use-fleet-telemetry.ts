import { useQuery } from "@tanstack/react-query";
import { fetchTelemetryLatest } from "@/features/fleet/api/fleet.api";
import { env } from "@/shared/lib/env";

export function useFleetTelemetry(fleetId: string | null) {
  return useQuery({
    queryKey: ["telemetry", fleetId ?? "kosong", "latest"],
    queryFn: () => fetchTelemetryLatest(fleetId ?? ""),
    enabled: fleetId !== null,
    staleTime: 15_000,
    refetchInterval: env.VITE_POLL_FLEET_MS
  });
}