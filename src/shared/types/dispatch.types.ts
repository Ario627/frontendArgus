import type { GateStatus } from "@/shared/constants/gate.constant";
import type { WasteFlow } from "@/shared/constants/flow.constant";

export type DispatchReasonTone = "daun" | "kuning" | "bata" | "netral";

export interface DispatchReason {
  readonly code: string;
  readonly label: string;
  readonly tone: "daun" | "kunyit" | "bata" | "netral";
}

export interface DispatchLeg {
  readonly vehicleId: string;
  readonly kode: string;
  readonly etaSeconds: number;
  readonly distanceMeters: number;
  readonly congestionRatio: number | null;
  readonly capacityOk: boolean;
  readonly fitScore: number;
}

export interface DispatchBoardItem {
  readonly batchId: string;
  readonly sppgId: string;
  readonly sppgNama: string;
  readonly aliran: WasteFlow;
  readonly weightKg: number;
  readonly gateStatus: GateStatus | null;
  readonly createdAt: string;
  readonly ageHours: number;
  readonly late: boolean;
  readonly priority: number;
  readonly eligible: boolean;
  readonly components: {
    readonly age: number;
    readonly gate: number;
    readonly weight: number;
    readonly reach: number;
  };
  readonly reasons: readonly DispatchReason[];
  readonly recommendedVehicleId: string | null;
  readonly recommendedEtaSeconds: number | null;
  readonly congestionRatio: number | null;
  readonly legs: readonly DispatchLeg[];
}

export interface DispatchVehicle {
  readonly id: string;
  readonly kode: string;
  readonly kapasitasKg: number | null;
  readonly loadKg: number;
  readonly openStops: number;
  readonly online: boolean;
  readonly stalenessSeconds: number | null;
}

export interface DispatchBoard {
  readonly generatedAt: string;
  readonly tanggal: string;
  readonly scopeSppgId: string | null;
  readonly matrixSource: "mapbox" | "haversine";
  readonly vehicles: readonly DispatchVehicle[];
  readonly items: readonly DispatchBoardItem[];
  readonly waitingCount: number;
  readonly waitingKg: number;
  readonly note: string | null;
}

export interface DispatchAssignment {
  readonly batchId: string;
  readonly fleetId: string;
  readonly planId: string;
  readonly stopId: string;
  readonly urutan: number;
  readonly auto: boolean;
}

export interface AutoDispatchResult {
  readonly assigned: readonly DispatchAssignment[];
  readonly skipped: readonly { readonly batchId: string; readonly reason: string }[];
}
