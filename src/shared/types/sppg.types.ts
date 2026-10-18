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

import { DISTRIBUTION_POINT_KINDS } from "@/shared/constants/point.constant";
import type { DistributionPointKind } from "@/shared/constants/point.constant";

export { DISTRIBUTION_POINT_KINDS };
export type { DistributionPointKind };

export interface PointDto {
  readonly id: string;
  readonly sppgId: string;
  readonly nama: string;
  readonly jenis: DistributionPointKind;
  readonly lat: number | null;
  readonly lng: number | null;
  readonly aktif: boolean;
}

export interface SppgDetailDto extends SppgDto {
  readonly points: readonly PointDto[];
}