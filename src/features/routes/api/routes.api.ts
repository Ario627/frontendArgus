import { apiGet, apiPatch, apiPost } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import { toSearchParams } from "@/shared/lib/search-params";
import type { PaginatedItems } from "@/shared/types/api.types";
import type { FacilityDto } from "@/shared/types/facility.types";
import type {
  ConfirmStopInput,
  PlanRouteInput,
  PlanRouteResult,
  RoutePlanDetailDto,
  RoutePlanDto,
  RouteStopDto
} from "@/shared/types/route.types";

export type RouteQuery = {
  readonly tanggal?: string;
  readonly status?: string;
  readonly sppgId?: string;
  readonly page?: number;
  readonly limit?: number;
}

export function fetchRoutes(query: RouteQuery): Promise<PaginatedItems<RoutePlanDto>> {
  return apiGet<PaginatedItems<RoutePlanDto>>(`${endpoints.routes.list}${toSearchParams(query)}`);
}

export function fetchRouteDetail(planId: string): Promise<RoutePlanDetailDto> {
  return apiGet<RoutePlanDetailDto>(endpoints.routes.detail(planId));
}

export function planRoute(input: PlanRouteInput): Promise<PlanRouteResult> {
  return apiPost<PlanRouteResult>(endpoints.routes.plan, input);
}

export function replanRoute(planId: string): Promise<PlanRouteResult> {
  return apiPost<PlanRouteResult>(endpoints.routes.replan(planId));
}

export function confirmStop(
  planId: string,
  stopId: string,
  input: ConfirmStopInput
): Promise<RouteStopDto> {
  return apiPatch<RouteStopDto>(endpoints.routes.updateStop(planId, stopId), input);
}

export type FacilityQuery = {
  readonly aktif?: boolean;
  readonly page?: number;
  readonly limit?: number;
}

export function fetchFacilities(query: FacilityQuery = {}): Promise<PaginatedItems<FacilityDto>> {
  return apiGet<PaginatedItems<FacilityDto>>(
    `${endpoints.facilities.list}${toSearchParams(query)}`
  );
}