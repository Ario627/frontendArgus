import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchDirections, formatCoordinate } from "@/features/navigation/api/directions.api";
import type { LatLng } from "@/shared/types/maps.types";

const DIRECTIONS_STALE_MS = 45_000;

export function useDirections(from: LatLng | null, to: LatLng | null, enabled = true) {
  const fromKey = from === null ? "kosong" : formatCoordinate(from);
  const toKey = to === null ? "kosong" : formatCoordinate(to);
  const ready = from !== null && to !== null && enabled;

  return useQuery({
    queryKey: qk.maps.directions(fromKey, toKey),
    queryFn: () => fetchDirections(from ?? { lat: 0, lng: 0 }, to ?? { lat: 0, lng: 0 }),
    enabled: ready,
    staleTime: DIRECTIONS_STALE_MS,
    retry: 1
  });
}
