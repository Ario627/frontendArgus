import type { StatusTone } from "@/shared/constants/tone.constant";

export const GATE_STATUSES = Object.freeze(["LOLOS", "PERBAIKI", "ALIHKAN", "TOLAK"] as const);

export type GateStatus = (typeof GATE_STATUSES)[number];

export const GATE_TONES: Readonly<Record<GateStatus, StatusTone>> = Object.freeze({
  LOLOS: "daun",
  PERBAIKI: "kunyit",
  ALIHKAN: "biru-tinta",
  TOLAK: "bata"
});

const GATE_STATUS_SET: ReadonlySet<string> = new Set(GATE_STATUSES);

export function isGateStatus(value: unknown): value is GateStatus {
  return typeof value === "string" && GATE_STATUS_SET.has(value);
}