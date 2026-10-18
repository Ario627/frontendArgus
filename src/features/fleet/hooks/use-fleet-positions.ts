import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchFleetPositions } from "@/features/fleet/api/fleet.api";

export function useFleetPositions(fleetId: string | null, minutes: number, enabled = true) {
  return useQuery({
    queryKey: qk.fleet.positions(fleetId ?? "kosong", minutes),
    queryFn: () => fetchFleetPositions(fleetId ?? "", minutes),
    enabled: fleetId !== null && enabled,
    staleTime: 30_000
  });
}
