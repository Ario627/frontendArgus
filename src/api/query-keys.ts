import type { FleetFilters } from "../shared/types/fleet.types";

export const queryKeys = {
  fleet: {
    all: ["fleet"] as const,
    list: (filters?: FleetFilters) => ["fleet", "list", filters] as const,
    detail: (id: string) => ["fleet", "detail", id] as const,
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
  recovery: {
    result: (id: string) => ["recovery", "result", id] as const,
  },
  health: ["health"] as const,
} as const;