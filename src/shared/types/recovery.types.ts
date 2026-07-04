export interface RecoveryResult {
  readonly brokenFleetId: string;
  readonly receivingFleetIds: readonly string[];
  readonly redistributedStopIds: readonly string[];
  readonly durationMs: number;
  readonly fallback: boolean;
  readonly status: "success" | "no_receiver" | "fallback_greedy";
  readonly llmNarrative: string | null;
}

export interface RecoveryAssignPayload {
  readonly brokenFleetId: string;
  readonly receivingFleetIds: readonly string[];
  readonly redistributedStopIds: readonly string[];
}

export interface RecoveryTriggerPayload {
  readonly brokenFleetId: string;
  readonly manual?: boolean;
}
