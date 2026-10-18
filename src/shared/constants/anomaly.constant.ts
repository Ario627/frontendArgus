import type { StatusTone } from "@/shared/constants/tone.constant";

export const ANOMALY_KINDS = Object.freeze([
  "NERACA_MASSA",
  "DURASI_UMUR",
  "DIGIT_TIDAK_WAJAR",
  "RANTAI_TIMPA",
  "JEDA_PENGAMBILAN"
] as const);

export type AnomalyKind = (typeof ANOMALY_KINDS)[number];

export const ANOMALY_KIND_LABELS: Readonly<Record<AnomalyKind, string>> = Object.freeze({
  NERACA_MASSA: "Neraca massa",
  DURASI_UMUR: "Durasi umur",
  DIGIT_TIDAK_WAJAR: "Digit tidak wajar",
  RANTAI_TIMPA: "Rantai timpa",
  JEDA_PENGAMBILAN: "Jeda pengambilan"
});

export const ANOMALY_SEVERITIES = Object.freeze(["INFO", "PERHATIAN", "KRITIS"] as const);

export type AnomalySeverity = (typeof ANOMALY_SEVERITIES)[number];

export const ANOMALY_SEVERITY_LABELS: Readonly<Record<AnomalySeverity, string>> = Object.freeze({
  INFO: "Info",
  PERHATIAN: "Perhatian",
  KRITIS: "Kritis"
});

export const ANOMALY_SEVERITY_RANK: Readonly<Record<AnomalySeverity, number>> = Object.freeze({
  INFO: 0,
  PERHATIAN: 1,
  KRITIS: 2
});

export const ANOMALY_SEVERITY_TONES: Readonly<Record<AnomalySeverity, StatusTone>> = Object.freeze({
  INFO: "netral",
  PERHATIAN: "kunyit",
  KRITIS: "bata"
});

const ANOMALY_KIND_SET: ReadonlySet<string> = new Set(ANOMALY_KINDS);

export function isAnomalyKind(value: unknown): value is AnomalyKind {
  return typeof value === "string" && ANOMALY_KIND_SET.has(value);
}