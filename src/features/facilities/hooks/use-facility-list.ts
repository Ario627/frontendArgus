import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchFacilityList } from "@/features/facilities/api/facilities.api";

const REFERENCE_STALE_MS = 30 * 60 * 1000;

export function useFacilityList(aktif = true) {
  return useQuery({
    queryKey: qk.facilities.list({ aktif, limit: 100 }),
    queryFn: () => fetchFacilityList({ aktif, limit: 100 }),
    staleTime: REFERENCE_STALE_MS
  });
}
