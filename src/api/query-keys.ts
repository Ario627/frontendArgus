import type { FleetFilters } from "../shared/types/fleet.types";

export const queryKeys = {
  fleet: {
    all: ["fleet"] as const,
    list: (filters?: FleetFilters) => ["fleet", "list", filters] as const,
    detail: (id: string) => ["fleet", "detail", id] as const,
  },
  device: {
    all: ["device"] as const,
    list: (status?: string) => ["device", "list", status] as const,
    unassigned: ["device", "unassigned"] as const,
    detail: (deviceId: string) => ["device", "detail", deviceId] as const,
  },
  destination: {
    all: ["destination"] as const,
    list: () => ["destination", "list"] as const,
    detail: (id: string) => ["destination", "detail", id] as const,
  },
  dashboard: {
    summary: ["dashboard", "summary"] as const,
    fleetPositions: ["dashboard", "fleet-positions"] as const,
  },
  optimization: {
    all: ["optimization"] as const,
    result: ["optimization", "result"] as const,
  },
  recovery: {
    all: ["recovery"] as const,
    result: (id: string) => ["recovery", "result", id] as const,
  },
  health: ["health"] as const,
} as const;
