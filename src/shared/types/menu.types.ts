import type { InsightConfidence, MenuComponent } from "@/shared/constants/menu.constant";
import type { LeftoverLevel } from "@/shared/constants/leftover.constant";

export interface MenuItemDto {
  readonly id: string;
  readonly nama: string;
  readonly komponen: MenuComponent;
  readonly biayaRp: number | null;
  readonly aktif: boolean;
}

export interface MenuInsightItem {
  readonly menuItemId: string;
  readonly nama: string;
  readonly komponen: MenuComponent;
  readonly biayaRp: number | null;
  readonly avgTingkatSisa: number;
  readonly n: number;
  readonly hari: number;
  readonly totalPorsiDinilai: number;
  readonly estimasiNilaiTerbuangRpPerHari: number | null;
  readonly confidence: InsightConfidence;
  readonly catatan: string | null;
}

export interface MenuInsightReport {
  readonly sppgId: string | null;
  readonly titikId: string | null;
  readonly from: string;
  readonly to: string;
  readonly metodeEstimasi: string;
  readonly sampleMin: number;
  readonly items: readonly MenuInsightItem[];
}

export interface CreateObservationInput {
  readonly clientEventId: string;
  readonly tanggal: string;
  readonly titikId: string;
  readonly menuItemId: string;
  readonly tingkatSisa: LeftoverLevel;
  readonly jumlahPorsiDinilai: number;
}

export interface CreateMenuItemInput {
  readonly nama: string;
  readonly komponen: MenuComponent;
  readonly biayaRp?: number;
}

export interface MenuServingDto {
  readonly id: string;
  readonly tanggal: string;
  readonly sppgId: string;
  readonly menuItemId: string;
  readonly titikId: string | null;
}

export interface MenuServingCreateResult {
  readonly id: string;
  readonly tanggal: string;
  readonly sppgId: string;
  readonly menuItemId: string;
  readonly titikId: string | null;
  readonly duplicate: boolean;
}

export interface CreateServingInput {
  readonly tanggal: string;
  readonly sppgId?: string;
  readonly menuItemId: string;
  readonly titikId?: string;
}