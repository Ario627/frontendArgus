import type { OperationalStatus, HardwareStatus } from "../types/common.types";

export const OPERATIONAL_STATUS_VALUES = Object.freeze([
  "ONLINE_NORMAL",
  "ONLINE_BROKEN",
  "STALE",
  "OFFLINE",
] as const);

export const HARDWARE_STATUS_VALUES = Object.freeze([
  "normal",
  "broken",
] as const);

export interface StatusConfig {
  readonly colorClass: string;
  readonly label: string;
}

export const OPERATIONAL_STATUS_CONFIG: Readonly<
  Record<OperationalStatus, StatusConfig>
> = Object.freeze({
  ONLINE_NORMAL: { colorClass: "bg-status-normal", label: "Normal" },
  ONLINE_BROKEN: { colorClass: "bg-status-broken", label: "Rusak (Online)" },
  STALE: { colorClass: "bg-status-stale", label: "Stale" },
  OFFLINE: { colorClass: "bg-status-offline", label: "Offline" },
});

export const HARDWARE_STATUS_CONFIG: Readonly<
  Record<HardwareStatus, StatusConfig>
> = Object.freeze({
  normal: { colorClass: "bg-status-normal", label: "Normal" },
  broken: { colorClass: "bg-status-broken", label: "Rusak" },
});