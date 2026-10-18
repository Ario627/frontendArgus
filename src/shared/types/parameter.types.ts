export const PARAMETER_KEYS = Object.freeze([
  "biaya_per_km",
  "faktor_muat",
  "biaya_tolak",
  "penalti_umur_per_jam",
  "susut_wajar_proksi",
  "toleransi_neraca",
  "ambang_proporsi_digit",
  "kecepatan_kota_km_jam"
] as const);

export type ParameterKey = (typeof PARAMETER_KEYS)[number];

export const PARAMETER_SOURCES = Object.freeze([
  "literatur",
  "kalibrasi_pilot",
  "manual_admin",
  "belum_ada"
] as const);

export type ParameterSource = (typeof PARAMETER_SOURCES)[number];

export interface ParameterDto {
  readonly kunci: ParameterKey;
  readonly nilai: number | null;
  readonly satuan: string | null;
  readonly sumber: ParameterSource;
  readonly catatan: string | null;
  readonly terkalibrasi: boolean;
  readonly updatedAt: string | null;
  readonly updatedBy: string | null;
}

export interface UpdateParameterInput {
  readonly nilai: number | null;
  readonly sumber: ParameterSource;
  readonly satuan: string | null;
  readonly catatan: string | null;
}

const PARAMETER_KEY_SET: ReadonlySet<string> = new Set(PARAMETER_KEYS);

export function isParameterKey(value: unknown): value is ParameterKey {
  return typeof value === "string" && PARAMETER_KEY_SET.has(value);
}