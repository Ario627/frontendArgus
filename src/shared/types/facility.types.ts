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