import { apiGet } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import { toSearchParams } from "@/shared/lib/search-params";
import type { PaginatedItems } from "@/shared/types/api.types";
import type { FacilityDto, ProfileDto } from "@/shared/types/facility.types";

export interface FacilityQuery {
  readonly aktif?: boolean;
  readonly page?: number;
  readonly limit?: number;
}

export interface ProfileVersionsQuery {
  readonly page?: number;
  readonly limit?: number;
}

export function fetchFacilityList(query: FacilityQuery = {}): Promise<PaginatedItems<FacilityDto>> {
  return apiGet<PaginatedItems<FacilityDto>>(
    `${endpoints.facilities.list}${toSearchParams({ ...query })}`
  );
}

export function fetchFacilityProfile(facilityId: string): Promise<ProfileDto> {
  return apiGet<ProfileDto>(endpoints.facilities.profile(facilityId));
}

export function fetchProfileVersions(
  facilityId: string,
  query: ProfileVersionsQuery = {}
): Promise<PaginatedItems<ProfileDto>> {
  return apiGet<PaginatedItems<ProfileDto>>(
    `${endpoints.facilities.profileVersions(facilityId)}${toSearchParams({ ...query })}`
  );
}
