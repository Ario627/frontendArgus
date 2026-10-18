import { apiGet, apiPatch, apiPost } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import { toSearchParams } from "@/shared/lib/search-params";
import type { PaginatedItems } from "@/shared/types/api.types";
import type {
  DistributionPointKind,
  PointDto,
  SppgDetailDto,
  SppgDto
} from "@/shared/types/sppg.types";

export type SppgListQuery = {
  readonly aktif?: boolean;
  readonly page?: number;
  readonly limit?: number;
};

export interface CreateSppgInput {
  readonly nama: string;
  readonly alamat?: string | null;
  readonly lat: number;
  readonly lng: number;
  readonly porsiPerHari: number;
  readonly mitra?: string | null;
  readonly kapasitasOlahKg?: number | null;
}

export interface UpdateSppgInput {
  readonly nama?: string;
  readonly alamat?: string | null;
  readonly lat?: number;
  readonly lng?: number;
  readonly porsiPerHari?: number;
  readonly mitra?: string | null;
  readonly kapasitasOlahKg?: number | null;
  readonly aktif?: boolean;
}

export interface CreatePointInput {
  readonly nama: string;
  readonly jenis: DistributionPointKind;
  readonly lat?: number | null;
  readonly lng?: number | null;
}

export interface UpdatePointInput {
  readonly nama?: string;
  readonly jenis?: DistributionPointKind;
  readonly lat?: number | null;
  readonly lng?: number | null;
  readonly aktif?: boolean;
}

export function fetchSppgList(query: SppgListQuery = {}): Promise<PaginatedItems<SppgDto>> {
  return apiGet<PaginatedItems<SppgDto>>(`${endpoints.sppg.list}${toSearchParams(query)}`);
}

export function fetchSppgDetail(sppgId: string): Promise<SppgDetailDto> {
  return apiGet<SppgDetailDto>(endpoints.sppg.detail(sppgId));
}

export function createSppg(input: CreateSppgInput): Promise<SppgDto> {
  return apiPost<SppgDto>(endpoints.sppg.create, input);
}

export function updateSppg(sppgId: string, input: UpdateSppgInput): Promise<SppgDto> {
  return apiPatch<SppgDto>(endpoints.sppg.update(sppgId), input);
}

export function createSppgPoint(sppgId: string, input: CreatePointInput): Promise<PointDto> {
  return apiPost<PointDto>(endpoints.sppg.addPoint(sppgId), input);
}

export function updateSppgPoint(
  sppgId: string,
  pointId: string,
  input: UpdatePointInput
): Promise<PointDto> {
  return apiPatch<PointDto>(endpoints.sppg.updatePoint(sppgId, pointId), input);
}