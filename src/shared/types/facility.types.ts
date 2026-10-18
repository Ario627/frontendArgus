import type { FractionCode } from "@/shared/constants/fraction.constant";
import type { WasteFlow } from "@/shared/constants/flow.constant";

export const FACILITY_LEVELS = Object.freeze(["T1", "T2", "T3", "T4"] as const);

export type FacilityLevel = (typeof FACILITY_LEVELS)[number];
export const FACILITY_KINDS = Object.freeze([
  "komposter",
  "bsf",
  "hub",
  "tps3r",
  "tpa",
  "lainnya"
] as const);

export type FacilityKind = (typeof FACILITY_KINDS)[number];

export const FACILITY_KIND_LABELS: Readonly<Record<FacilityKind, string>> = Object.freeze({
  komposter: "Komposter",
  bsf: "BSF",
  hub: "Hub",
  tps3r: "TPS3R",
  tpa: "TPA",
  lainnya: "Lainnya"
});

export interface FacilityDto {
  readonly id: string;
  readonly nama: string;
  readonly tingkat: FacilityLevel;
  readonly jenis: FacilityKind;
  readonly lat: number;
  readonly lng: number;
  readonly kapasitasKgHari: number | null;
  readonly jamOperasi: string | null;
  readonly mitra: boolean;
  readonly aktif: boolean;
  readonly isDemo: boolean;
  readonly createdAt: string;
}

export interface ProfileDto {
  readonly id: string;
  readonly facilityId: string;
  readonly version: number;
  readonly rules: Record<string, unknown>;
  readonly effectiveFrom: string;
  readonly effectiveUntil: string | null;
  readonly createdBy: string | null;
  readonly createdAt: string;
}

export type VisibleOilPolicy = "fix" | "reject" | "allow";

export interface AcceptanceMoistureRules {
  readonly passMin: number | null;
  readonly passMax: number | null;
  readonly fixAbove: number | null;
  readonly rejectAbove: number | null;
}

export interface AcceptanceContaminantRules {
  readonly plasticPercentMax: number | null;
  readonly visibleOil: VisibleOilPolicy;
}

export interface AcceptanceProfileRules {
  readonly acceptsFractions: readonly FractionCode[];
  readonly acceptsFlows: readonly WasteFlow[];
  readonly moisture: AcceptanceMoistureRules;
  readonly maxAgeHours: number | null;
  readonly contaminant: AcceptanceContaminantRules;
  readonly capacityKgPerDay: number | null;
  readonly operatingHours: string | null;
  readonly pricePerKg: number | null;
}

export interface CreateFacilityInput {
  readonly nama: string;
  readonly tingkat: FacilityLevel;
  readonly jenis: FacilityKind;
  readonly lat: number;
  readonly lng: number;
  readonly kapasitasKgHari?: number | null;
  readonly jamOperasi?: string | null;
  readonly mitra?: boolean;
  readonly aktif?: boolean;
}

export interface UpdateFacilityInput {
  readonly nama?: string;
  readonly tingkat?: FacilityLevel;
  readonly jenis?: FacilityKind;
  readonly lat?: number;
  readonly lng?: number;
  readonly kapasitasKgHari?: number | null;
  readonly jamOperasi?: string | null;
  readonly mitra?: boolean;
  readonly aktif?: boolean;
}