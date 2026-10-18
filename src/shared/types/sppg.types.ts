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