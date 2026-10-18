import { apiGet } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import { toSearchParams } from "@/shared/lib/search-params";
import type { PaginatedItems } from "@/shared/types/api.types";
import type { SppgDto } from "@/shared/types/sppg.types";

export type SppgListQuery = {
  readonly aktif?: boolean;
  readonly page?: number;
  readonly limit?: number;
};

export function fetchSppgList(query: SppgListQuery = {}): Promise<PaginatedItems<SppgDto>> {
  return apiGet<PaginatedItems<SppgDto>>(`${endpoints.sppg.list}${toSearchParams(query)}`);
}