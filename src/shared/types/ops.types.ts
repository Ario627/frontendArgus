export type ProbeState = "ok" | "down" | "unknown";

export interface HealthReport {
  readonly status: "ok" | "degraded";
  readonly db: boolean;
  readonly mqtt: ProbeState;
  readonly optimizer: ProbeState;
  readonly uptimeSeconds: number;
}

export interface ChainSweepReport {
  readonly checkedAt: string;
  readonly checked: number;
  readonly failed: number;
  readonly errors: number;
  readonly breachBatchIds: readonly string[];
  readonly skipped: boolean;
}

export interface RetentionRunReport {
  readonly ranAt: string;
  readonly purgeEnabled: boolean;
  readonly telemetryBefore: string;
  readonly photoTicketBefore: string;
  readonly photoBatchBefore: string;
  readonly compressAfterDays: number;
  readonly compressPolicyChanged: boolean;
  readonly telemetryChunksDropped: number;
  readonly photoCandidates: number;
  readonly photosDeleted: number;
  readonly failures: number;
  readonly skipped: boolean;
}
