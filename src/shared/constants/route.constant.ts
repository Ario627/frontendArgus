export const ROUTE_STATUSES = Object.freeze([
  "DRAFT",
  "AKTIF",
  "SELESAI",
  "NEEDS_MANUAL_SCHEDULING",
  "BATAL"
] as const);

export type RouteStatus = (typeof ROUTE_STATUSES)[number];

export const ROUTE_STATUS_LABELS: Readonly<Record<RouteStatus, string>> = Object.freeze({
  DRAFT: "Draf",
  AKTIF: "Aktif",
  SELESAI: "Selesai",
  NEEDS_MANUAL_SCHEDULING: "Perlu jadwal manual",
  BATAL: "Dibatalkan"
});

export const ROUTE_SOURCES = Object.freeze(["optimizer", "greedy", "manual"] as const);

export type RouteSource = (typeof ROUTE_SOURCES)[number];

export const ROUTE_STOP_KINDS = Object.freeze(["AMBIL", "ANTAR"] as const);

export type RouteStopKind = (typeof ROUTE_STOP_KINDS)[number];

export const ROUTE_STOP_KIND_LABELS: Readonly<Record<RouteStopKind, string>> = Object.freeze({
  AMBIL: "Ambil",
  ANTAR: "Antar"
});

export const ROUTE_STOP_STATUSES = Object.freeze(["RENCANA", "SAMPAI", "SELESAI", "GAGAL"] as const);

export type RouteStopStatus = (typeof ROUTE_STOP_STATUSES)[number];

export const ROUTE_STOP_STATUS_LABELS: Readonly<Record<RouteStopStatus, string>> = Object.freeze({
  RENCANA: "Rencana",
  SAMPAI: "Sampai",
  SELESAI: "Selesai",
  GAGAL: "Gagal"
});

export const CONFIRMABLE_STOP_STATUSES = Object.freeze(["SAMPAI", "SELESAI", "GAGAL"] as const);

export type ConfirmableStopStatus = (typeof CONFIRMABLE_STOP_STATUSES)[number];

const ROUTE_STATUS_SET: ReadonlySet<string> = new Set(ROUTE_STATUSES);
const ROUTE_SOURCE_SET: ReadonlySet<string> = new Set(ROUTE_SOURCES);

export function isRouteStatus(value: unknown): value is RouteStatus {
  return typeof value === "string" && ROUTE_STATUS_SET.has(value);
}

export function isRouteSource(value: unknown): value is RouteSource {
  return typeof value === "string" && ROUTE_SOURCE_SET.has(value);
}