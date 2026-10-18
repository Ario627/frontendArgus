import { apiGet, apiPost } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import { toSearchParams } from "@/shared/lib/search-params";
import type { PaginatedItems } from "@/shared/types/api.types";
import type {
  LinkScaleInput,
  ScaleLinkResultDto,
  ScalePendingDto
} from "@/shared/types/scale.types";

export interface ScalePendingQuery {
  readonly sppgId?: string;
  readonly page?: number;
  readonly limit?: number;
}

export function fetchScalePending(
  query: ScalePendingQuery = {}
): Promise<PaginatedItems<ScalePendingDto>> {
  return apiGet<PaginatedItems<ScalePendingDto>>(
    `${endpoints.scale.pendingList}${toSearchParams({ ...query })}`
  );
}

export function fetchScalePendingDetail(id: string): Promise<ScalePendingDto> {
  return apiGet<ScalePendingDto>(endpoints.scale.pendingDetail(id));
}

export interface LinkScaleVariables {
  readonly pendingId: string;
  readonly input: LinkScaleInput;
}

export function linkScale(variables: LinkScaleVariables): Promise<ScaleLinkResultDto> {
  return apiPost<ScaleLinkResultDto>(endpoints.scale.link(variables.pendingId), variables.input);
}
