import type { WasteFlow } from "@/shared/constants/flow.constant";

export const BATCH_STATUSES = Object.freeze([
  "DICATAT",
  "MENUNGGU_ANGKUT",
  "DIANGKUT",
  "DITERIMA",
  "DIOLAH",
  "SELESAI",
  "GAGAL_GATE",
  "TERSANGKUT"
] as const);

export type BatchStatus = (typeof BATCH_STATUSES)[number];

export const BATCH_STATUS_LABELS: Readonly<Record<BatchStatus, string>> = Object.freeze({
  DICATAT: "Dicatat",
  MENUNGGU_ANGKUT: "Menunggu angkut",
  DIANGKUT: "Diangkut",
  DITERIMA: "Diterima",
  DIOLAH: "Diolah",
  SELESAI: "Selesai",
  GAGAL_GATE: "Perlu perbaikan",
  TERSANGKUT: "Tersangkut"
});

export const BATCH_WEIGHT_LIMITS = Object.freeze({
  minKg: 0.1,
  maxKg: 500,
  minyakMaxKg: 200
});

const BATCH_STATUS_SET: ReadonlySet<string> = new Set(BATCH_STATUSES);

export function isBatchStatus(value: unknown): value is BatchStatus {
  return typeof value === "string" && BATCH_STATUS_SET.has(value);
}

export function maxWeightForFlow(flow: WasteFlow): number {
  return flow === "minyak" ? BATCH_WEIGHT_LIMITS.minyakMaxKg : BATCH_WEIGHT_LIMITS.maxKg;
}