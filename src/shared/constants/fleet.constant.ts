export const FLEET_STATUSES = Object.freeze([
  "ONLINE_NORMAL",
  "ONLINE_BROKEN",
  "STALE",
  "OFFLINE"
] as const);

export type FleetStatus = (typeof FLEET_STATUSES)[number];

export const FLEET_STATUS_LABELS: Readonly<Record<FleetStatus, string>> = Object.freeze({
  ONLINE_NORMAL: "Normal",
  ONLINE_BROKEN: "Perangkat rusak",
  STALE: "Laporan terlambat",
  OFFLINE: "Tidak aktif"
});

export const HARDWARE_STATUSES = Object.freeze(["normal", "broken"] as const);

export type HardwareStatus = (typeof HARDWARE_STATUSES)[number];

const FLEET_STATUS_SET: ReadonlySet<string> = new Set(FLEET_STATUSES);

export function isFleetStatus(value: unknown): value is FleetStatus {
  return typeof value === "string" && FLEET_STATUS_SET.has(value);
}