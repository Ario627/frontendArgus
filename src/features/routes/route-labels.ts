import type {
  ConfirmableStopStatus,
  RouteSource,
  RouteStatus,
  RouteStopStatus
} from "@/shared/constants/route.constant";
import type { StatusTone } from "@/shared/constants/tone.constant";

export const ROUTE_STATUS_TONES: Readonly<Record<RouteStatus, StatusTone>> = Object.freeze({
  DRAFT: "netral",
  AKTIF: "biru-tinta",
  SELESAI: "daun",
  NEEDS_MANUAL_SCHEDULING: "kunyit",
  BATAL: "bata"
});

export const ROUTE_SOURCE_LABELS: Readonly<Record<RouteSource, string>> = Object.freeze({
  optimizer: "Optimizer",
  greedy: "Greedy",
  manual: "Manual"
});

export const PLAN_REASON_LABELS: Readonly<Record<string, string>> = Object.freeze({
  REPLAN: "Dibuat ulang (re-plan)",
  ARMADA_RUSAK: "Pemulihan otomatis — ada armada rusak",
  OPTIMIZER_TIDAK_TERSEDIA: "Optimizer tidak tersedia — perlu penjadwalan manual"
});

export const UNASSIGNED_REASON_LABELS: Readonly<Record<string, string>> = Object.freeze({
  TANPA_FASILITAS: "batch belum punya fasilitas tujuan",
  TANPA_ARMADA: "tidak ada armada yang tersedia",
  SISA: "tidak muat di kapasitas yang tersedia"
});

export const MATRIX_SOURCE_LABELS: Readonly<Record<string, string>> = Object.freeze({
  mapbox: "matriks Mapbox",
  haversine: "jarak garis lurus (perkiraan)"
});

export function describeSpeedSource(source: string): string {
  if (source.startsWith("parameter:")) {
    const key = source.slice("parameter:".length);
    return `parameter ${key.replaceAll("_", " ")}`;
  }
  return source;
}

export function stopActionsFor(status: RouteStopStatus): readonly ConfirmableStopStatus[] {
  if (status === "RENCANA") return ["SAMPAI", "SELESAI", "GAGAL"];
  if (status === "SAMPAI") return ["SELESAI", "GAGAL"];
  return [];
}

export function isStopClosed(status: RouteStopStatus): boolean {
  return status === "SELESAI" || status === "GAGAL";
}