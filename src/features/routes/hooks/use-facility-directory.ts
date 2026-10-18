import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchFacilities } from "@/features/routes/api/routes.api";

const REFERENCE_STALE_MS = 30 * 60 * 1000;

export interface FacilityDirectoryEntry {
  readonly nama: string;
  readonly lat: number;
  readonly lng: number;
}

export function useFacilityDirectory(): ReadonlyMap<string, FacilityDirectoryEntry> {
  const query = useQuery({
    queryKey: qk.facilities.list({ aktif: true, limit: 100 }),
    queryFn: () => fetchFacilities({ aktif: true, limit: 100 }),
    staleTime: REFERENCE_STALE_MS
  });

  return useMemo(() => {
    const map = new Map<string, FacilityDirectoryEntry>();
    for (const facility of query.data?.items ?? []) {
      map.set(facility.id, { nama: facility.nama, lat: facility.lat, lng: facility.lng });
    }
    return map;
  }, [query.data]);
}
