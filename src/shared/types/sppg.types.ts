export interface SppgDto {
  readonly id: string;
  readonly publicSlug: string;
  readonly nama: string;
  readonly alamat: string | null;
  readonly lat: number;
  readonly lng: number;
  readonly porsiPerHari: number;
  readonly mitra: string | null;
  readonly kapasitasOlahKg: number | null;
  readonly aktif: boolean;
  readonly isDemo: boolean;
  readonly createdAt: string;
}

export const DISTRIBUTION_POINT_KINDS = Object.freeze([
  "sekolah",
  "paud",
  "posyandu",
  "puskesmas",
  "lainnya"
] as const);

export type DistributionPointKind = (typeof DISTRIBUTION_POINT_KINDS)[number];

export interface PointDto {
  readonly id: string;
  readonly sppgId: string;
  readonly nama: string;
  readonly jenis: DistributionPointKind;
  readonly lat: number | null;
  readonly lng: number | null;
}

export interface SppgDetailDto extends SppgDto {
  readonly points: readonly PointDto[];
}