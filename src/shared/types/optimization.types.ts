import type { DestinationType } from "./common.types";

export interface VehicleInput {
  readonly id: string;
  readonly startLat: number;
  readonly startLng: number;
  readonly capacityKg: number;
  readonly currentLoadKg: number;
}

export interface DestinationInput {
  readonly id: string;
  readonly type: DestinationType;
  readonly lat: number;
  readonly lng: number;
  readonly demandKg: number;
  readonly priority: number;
  readonly serviceMinutes: number;
  readonly historicalVolumeAvg: number;
  readonly lowVolumeFlag: boolean;
}

export interface DistanceMatrixRow {
  readonly from: string;
  readonly to: string;
  readonly meters: number;
  readonly seconds: number;
}

export interface DistanceMatrix {
  readonly mode: "mapbox" | "haversine_fallback";
  readonly rows: readonly DistanceMatrixRow[];
}

export interface OptimizationConstraints {
  readonly maxRouteMinutes: number;
  readonly finalDepotId: string;
  readonly skipLowVolume: boolean;
  readonly lowVolumeThreshold: number;
}

export interface OptimizationInput {
  readonly mode: "daily_plan" | "swarm_recovery";
  readonly vehicles: readonly VehicleInput[];
  readonly destinations: readonly DestinationInput[];
  readonly distanceMatrix: DistanceMatrix;
  readonly constraints: OptimizationConstraints;
}

export interface RouteStop {
  readonly destId: string;
  readonly order: number;
  readonly etaEpoch: number;
  readonly cumulativeKm: number;
}

export interface RouteResult {
  readonly vehicleId: string;
  readonly stops: readonly RouteStop[];
  readonly totalKm: number;
  readonly totalMinutes: number;
}

export interface SkippedDestination {
  readonly destId: string;
  readonly reason: string;
}

export interface OptimizationOutput {
  readonly status: "OK" | "NO_SOLUTION" | "FEASIBLE";
  readonly routes: readonly RouteResult[];
  readonly skipped: readonly SkippedDestination[];
  readonly solverDurationMs: number;
}