import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import {
  fetchFacilityProfile,
  fetchProfileVersions
} from "@/features/facilities/api/facilities.api";

const REFERENCE_STALE_MS = 30 * 60 * 1000;
const VERSIONS_LIMIT = 20;

export function useFacilityProfile(facilityId: string | null) {
  return useQuery({
    queryKey: qk.facilities.profile(facilityId ?? "kosong"),
    queryFn: () => fetchFacilityProfile(facilityId ?? ""),
    enabled: facilityId !== null,
    staleTime: REFERENCE_STALE_MS,
    retry: false
  });
}

export function useProfileVersions(facilityId: string | null) {
  return useQuery({
    queryKey: qk.facilities.profileVersions(facilityId ?? "kosong"),
    queryFn: () => fetchProfileVersions(facilityId ?? "", { limit: VERSIONS_LIMIT }),
    enabled: facilityId !== null,
    staleTime: REFERENCE_STALE_MS
  });
}
