export const API_ENDPOINTS = Object.freeze({
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
  },
  fleet: {
    list: "/fleet",
    detail: (id: string) => `/fleet/${id}` as const,
    create: "/fleet",
    update: (id: string) => `/fleet/${id}` as const,
    remove: (id: string) => `/fleet/${id}` as const,
    revokeDevice: (id: string) => `/fleet/${id}/revoke-device` as const,
  },
  destination: {
    list: "/destination",
    detail: (id: string) => `/destination/${id}` as const,
    create: "/destination",
    update: (id: string) => `/destination/${id}` as const,
    remove: (id: string) => `/destination/${id}` as const,
  },
  dashboard: {
    summary: "/dashboard/summary",
    fleetPositions: "/dashboard/fleet-positions",
  },
  optimization: {
    triggerDailyPlan: "/optimization/trigger",
  },
  recovery: {
    trigger: "/recovery/trigger",
    assign: "/recovery/assign",
    result: (id: string) => `/recovery/${id}` as const,
  },
  health: "/health",
} as const);
