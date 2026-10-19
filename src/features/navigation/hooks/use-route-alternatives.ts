import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import {
  fetchRouteAlternatives,
  formatCoordinate
} from "@/features/navigation/api/directions.api";
import type { LatLng } from "@/shared/types/maps.types";

const ROUTE_STALE_MS = 45_000;
const ROUTE_REFRESH_MS = 120_000;
const ROUTE_RETRY_MAX = 2;

export function useRouteAlternatives(from: LatLng | null, to: LatLng | null, enabled = true) {
  const fromKey = from === null ? "kosong" : formatCoordinate(from);
  const toKey = to === null ? "kosong" : formatCoordinate(to);
  const ready = from !== null && to !== null && enabled;

  return useQuery({
    queryKey: qk.maps.route(fromKey, toKey),
    queryFn: () => fetchRouteAlternatives(from ?? { lat: 0, lng: 0 }, to ?? { lat: 0, lng: 0 }),
    enabled: ready,
    staleTime: ROUTE_STALE_MS,
    refetchInterval: ready ? ROUTE_REFRESH_MS : false,
    retry: ROUTE_RETRY_MAX
  });
}
