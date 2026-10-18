import type { AnomalyKind, AnomalySeverity } from "@/shared/constants/anomaly.constant";
import type { BatchStatus } from "@/shared/constants/batch.constant";
import type { DeviceType } from "@/shared/constants/device.constant";
import type { FleetStatus } from "@/shared/constants/fleet.constant";
import type { WasteFlow } from "@/shared/constants/flow.constant";
import type { RouteStatus } from "@/shared/constants/route.constant";
import type { TicketKind, TicketStatus } from "@/shared/constants/ticket.constant";
import type { DispositionTier } from "@/shared/constants/tier.constant";

export interface SppgListFilters {
  readonly aktif?: boolean;
  readonly page?: number;
  readonly limit?: number;
}

export interface FacilityListFilters {
  readonly aktif?: boolean;
  readonly page?: number;
  readonly limit?: number;
}

export interface BatchListFilters {
  readonly sppgId?: string;
  readonly status?: BatchStatus;
  readonly tier?: DispositionTier;
  readonly aliran?: WasteFlow;
  readonly cursor?: string;
  readonly limit?: number;
}

export interface DispositionListFilters {
  readonly sppgId?: string;
  readonly date?: string;
}

export interface RouteListFilters {
  readonly tanggal?: string;
  readonly status?: RouteStatus;
  readonly sppgId?: string;
  readonly page?: number;
  readonly limit?: number;
}

export interface FleetListFilters {
  readonly aktif?: boolean;
  readonly status?: FleetStatus;
  readonly page?: number;
  readonly limit?: number;
}

export interface DeviceListFilters {
  readonly tipe?: DeviceType;
  readonly sppgId?: string;
  readonly fleetId?: string;
  readonly revoked?: boolean;
  readonly page?: number;
  readonly limit?: number;
}

export interface ScalePendingFilters {
  readonly sppgId?: string;
  readonly page?: number;
  readonly limit?: number;
}

export interface MenuItemsFilters {
  readonly aktif?: boolean;
  readonly page?: number;
  readonly limit?: number;
}

export interface MenuInsightsFilters {
  readonly sppgId?: string;
  readonly titikId?: string;
  readonly from?: string;
  readonly to?: string;
}

export interface TicketListFilters {
  readonly status?: TicketStatus;
  readonly jenis?: TicketKind;
  readonly sppgId?: string;
  readonly page?: number;
  readonly limit?: number;
}

export interface AnomalyListFilters {
  readonly jenis?: AnomalyKind;
  readonly tingkat?: AnomalySeverity;
  readonly terbuka?: boolean;
  readonly sppgId?: string;
  readonly page?: number;
  readonly limit?: number;
}

export interface AuditListFilters {
  readonly aktor?: string;
  readonly aksi?: string;
  readonly entitas?: string;
  readonly from?: string;
  readonly to?: string;
  readonly page?: number;
  readonly limit?: number;
}

export const qk = Object.freeze({
  me: ["me"] as const,
  health: ["health"] as const,
  sppg: Object.freeze({
    list: (filters?: SppgListFilters) => ["sppg", "list", filters ?? null] as const,
    detail: (id: string) => ["sppg", id] as const
  }),
  facilities: Object.freeze({
    list: (filters?: FacilityListFilters) => ["facilities", "list", filters ?? null] as const,
    detail: (id: string) => ["facilities", id] as const,
    profile: (id: string) => ["facilities", id, "profile"] as const,
    profileVersions: (id: string) => ["facilities", id, "profile", "versions"] as const
  }),
  batches: Object.freeze({
    list: (filters?: BatchListFilters) => ["batches", "list", filters ?? null] as const,
    detail: (id: string) => ["batches", id] as const,
    disposition: (id: string) => ["batches", id, "disposition"] as const
  }),
  dispositions: (filters?: DispositionListFilters) => ["dispositions", filters ?? null] as const,
  ledger: Object.freeze({
    list: (batchId: string) => ["ledger", batchId] as const,
    verify: (batchId: string) => ["ledger", batchId, "verify"] as const,
    recent: ["ledger", "recent"] as const
  }),
  routes: Object.freeze({
    list: (filters?: RouteListFilters) => ["routes", "list", filters ?? null] as const,
    detail: (id: string) => ["routes", id] as const
  }),
  fleet: Object.freeze({
    list: (filters?: FleetListFilters) => ["fleet", "list", filters ?? null] as const,
    detail: (id: string) => ["fleet", id] as const,
    positions: (id: string, minutes: number) => ["fleet", id, "positions", minutes] as const
  }),
  devices: Object.freeze({
    list: (filters?: DeviceListFilters) => ["devices", "list", filters ?? null] as const,
    detail: (id: string) => ["devices", id] as const
  }),
  scale: Object.freeze({
    pendingList: (filters?: ScalePendingFilters) => ["scale", "pending", "list", filters ?? null] as const,
    pendingDetail: (id: string) => ["scale", "pending", id] as const
  }),
  telemetry: Object.freeze({
    latest: (fleetId: string) => ["telemetry", fleetId, "latest"] as const
  }),
  menu: Object.freeze({
    items: (filters?: MenuItemsFilters) => ["menu", "items", filters ?? null] as const,
    insights: (filters?: MenuInsightsFilters) => ["menu", "insights", filters ?? null] as const
  }),
  tickets: Object.freeze({
    list: (filters?: TicketListFilters) => ["tickets", "list", filters ?? null] as const,
    detail: (id: string) => ["tickets", id] as const
  }),
  dashboard: Object.freeze({
    summary: (sppgId: string | null) => ["dashboard", "summary", sppgId ?? "semua"] as const,
    narrative: (sppgId: string | null) => ["dashboard", "narrative", sppgId ?? "semua"] as const
  }),
  anomalies: Object.freeze({
    list: (filters?: AnomalyListFilters) => ["anomalies", "list", filters ?? null] as const
  }),
  audit: Object.freeze({
    list: (filters?: AuditListFilters) => ["audit", "list", filters ?? null] as const
  }),
  parameters: ["parameters"] as const,
  publicSppg: (slug: string) => ["public", "sppg", slug] as const
});