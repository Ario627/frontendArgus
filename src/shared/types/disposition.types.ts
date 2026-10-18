import type { BatchStatus } from "@/shared/constants/batch.constant";
import type { GateStatus } from "@/shared/constants/gate.constant";
import type { WasteFlow } from "@/shared/constants/flow.constant";
import type { DispositionTier } from "@/shared/constants/tier.constant";

export interface DispositionQueueItem {
  readonly batchId: string;
  readonly sppgId: string;
  readonly aliran: WasteFlow;
  readonly weightKg: number;
  readonly ageHours: number;
  readonly status: BatchStatus;
  readonly gateStatus: GateStatus | null;
  readonly tier: DispositionTier | null;
  readonly chosenFacilityId: string | null;
  readonly decisionReason: string | null;
  readonly decidedAt: string | null;
}

export interface BatchDispositionDetail {
  readonly batchId: string;
  readonly sppgId: string;
  readonly tier: DispositionTier | null;
  readonly decidedAt: string | null;
  readonly detail: Record<string, unknown> | null;
}

export interface RunDispositionDecision {
  readonly batchId: string;
  readonly chosenTier: DispositionTier;
  readonly chosenFacilityId: string | null;
  readonly chosenFacilityNama: string | null;
  readonly reason: string;
}

export interface RunDispositionReport {
  readonly sppgId: string;
  readonly date: string;
  readonly processed: number;
  readonly decisions: readonly RunDispositionDecision[];
  readonly missingParameters: readonly string[];
}