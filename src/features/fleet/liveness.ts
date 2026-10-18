import { FLEET_STATUS_LABELS, type FleetStatus } from "@/shared/constants/fleet.constant";
import type { StatusTone } from "@/shared/constants/tone.constant";

export const FLEET_STATUS_TONES: Readonly<Record<FleetStatus, StatusTone>> = Object.freeze({
  ONLINE_NORMAL: "daun",
  ONLINE_BROKEN: "bata",
  STALE: "kunyit",
  OFFLINE: "netral"
});

export const ATTENTION_STATUSES: readonly FleetStatus[] = Object.freeze([
  "ONLINE_BROKEN",
  "STALE",
  "OFFLINE"
] as const);

export function isAttentionStatus(status: FleetStatus): boolean {
  return ATTENTION_STATUSES.includes(status);
}

export function formatStaleness(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "belum pernah lapor";
  if (seconds < 60) return `${Math.max(0, Math.round(seconds))} dtk lalu`;
  if (seconds < 3_600) return `${Math.floor(seconds / 60)} mnt lalu`;
  return `${Math.floor(seconds / 3_600)} j lalu`;
}

export function describeFleet(status: FleetStatus, stalenessSeconds: number | null): string {
  if (status === "OFFLINE") return "Tidak melapor sama sekali";
  if (status === "STALE") return `Laporan terlambat — ${formatStaleness(stalenessSeconds)}`;
  if (status === "ONLINE_BROKEN") return "Perangkat melaporkan rusak";
  return `Normal — ${formatStaleness(stalenessSeconds)}`;
}

export const FLEET_STATUS_TEXT = FLEET_STATUS_LABELS;