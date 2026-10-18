import type {
  ConfirmableStopStatus,
  RouteStopKind,
  RouteStopStatus,
  RouteSource,
  RouteStatus
} from "@/shared/constants/route.constant";

export type MatrixSource = "mapbox" | "haversine";

export interface RouteStopDto {
  readonly id: string;
  readonly planId: string;
  readonly batchId: string;
  readonly fleetId: string | null;
  readonly urutan: number;
  readonly jenis: RouteStopKind;
  readonly fasilitasId: string | null;
  readonly eta: string | null;
  readonly status: RouteStopStatus;
}

export interface RouteUnassignedEntry {
  readonly batchId: string;
  readonly reason: string;
}

export interface RouteVehicleSummary {
  readonly fleetId: string;
  readonly capacityKg: number;
}

export interface RouteSolverStats {
  readonly objective: number;
  readonly timeSeconds: number;
  readonly strategy?: string;
}

export interface RoutePlanSummary {
  readonly window: { readonly start: string; readonly end: string };
  readonly speedSource: string;
  readonly costSource?: string;
  readonly unassigned: readonly RouteUnassignedEntry[];
  readonly tanpaFasilitas: readonly string[];
  readonly skippedVehicles: readonly string[];
  readonly vehicles: readonly RouteVehicleSummary[];
  readonly solverStats: RouteSolverStats | null;
  readonly reason: string | null;
}

export interface RoutePlanDto {
  readonly id: string;
  readonly sppgId: string | null;
  readonly tanggal: string;
  readonly status: RouteStatus;
  readonly source: RouteSource;
  readonly matrixSource: MatrixSource;
  readonly lowConfidence: boolean;
  readonly totalKg: number;
  readonly totalKm: number | null;
  readonly finalStopId: string | null;
  readonly dibuatOleh: string | null;
  readonly isDemo: boolean;
  readonly createdAt: string;
  readonly ringkasan: RoutePlanSummary | null;
}

export interface RoutePlanDetailDto extends RoutePlanDto {
  readonly stops: readonly RouteStopDto[];
}

export interface PlanRouteResult {
  readonly plan: RoutePlanDetailDto;
  readonly degraded: boolean;
}

export interface PlanRouteInput {
  readonly sppgId: string;
  readonly tanggal?: string;
}

export interface ConfirmStopInput {
  readonly status: ConfirmableStopStatus;
}