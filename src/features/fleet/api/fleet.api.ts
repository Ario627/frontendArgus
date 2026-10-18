import { apiGet, apiPatch, apiPost } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import { toSearchParams } from "@/shared/lib/search-params";
import type { PaginatedItems } from "@/shared/types/api.types";
import type {
  CreateFleetInput,
  FleetDto,
  TelemetryLatestReport,
  UpdateFleetInput
} from "@/shared/types/fleet.types";
import type { FleetStatus } from "@/shared/constants/fleet.constant";

export type FleetQuery = {
  readonly aktif?: boolean;
  readonly status?: FleetStatus;
  readonly page?: number;
  readonly limit?: number;
}

export function fetchFleetList(query: FleetQuery = {}): Promise<PaginatedItems<FleetDto>> {
  return apiGet<PaginatedItems<FleetDto>>(`${endpoints.fleet.list}${toSearchParams(query)}`);
}

export function fetchFleetDetail(fleetId: string): Promise<FleetDto> {
  return apiGet<FleetDto>(endpoints.fleet.detail(fleetId));
}

export function fetchTelemetryLatest(fleetId: string): Promise<TelemetryLatestReport> {
  return apiGet<TelemetryLatestReport>(endpoints.telemetry.latest(fleetId));
}

export function createFleet(input: CreateFleetInput): Promise<FleetDto> {
  return apiPost<FleetDto>(endpoints.fleet.create, input);
}

export function updateFleet(fleetId: string, input: UpdateFleetInput): Promise<FleetDto> {
  return apiPatch<FleetDto>(endpoints.fleet.update(fleetId), input);
}