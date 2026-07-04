export interface DashboardSummary {
  readonly totalFleet: number;
  readonly onlineNormal: number;
  readonly onlineBroken: number;
  readonly stale: number;
  readonly offline: number;
  readonly recoveryCountToday: number;
  readonly avgRouteEfficiency: number;
  readonly llmSummary: string | null;
  readonly generatedAt: string;
}
