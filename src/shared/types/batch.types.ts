import type { BatchStatus } from "@/shared/constants/batch.constant";
import type { MoistureProxy, WasteFlow } from "@/shared/constants/flow.constant";
import type { FractionValues } from "@/shared/constants/fraction.constant";
import type { GateStatus } from "@/shared/constants/gate.constant";
import type { DispositionTier } from "@/shared/constants/tier.constant";
import type { LedgerEventDto } from "@/shared/types/ledger.types";

export interface BatchDto {
  readonly id: string;
  readonly sppgId: string;
  readonly aliran: WasteFlow;
  readonly dikeluarkanAt: string;
  readonly weightKg: number;
  readonly moistureProxy: MoistureProxy | null;
  readonly visibleOil: boolean;
  readonly fractions: FractionValues;
  readonly tier: DispositionTier | null;
  readonly dispositionReason: Record<string, unknown> | null;
  readonly gateStatus: GateStatus | null;
  readonly gateDetail: Record<string, unknown> | null;
  readonly status: BatchStatus;
  readonly photoHash: string | null;
  readonly clientEventId: string | null;
  readonly clockSkewMs: number | null;
  readonly isDemo: boolean;
  readonly createdAt: string;
}

export interface BatchDetailDto extends BatchDto {
  readonly ledger: readonly LedgerEventDto[];
}

export interface CreateBatchResult {
  readonly batch: BatchDetailDto;
  readonly duplicate: boolean;
}

export interface CreateBatchInput {
  readonly clientEventId: string;
  readonly sppgId: string;
  readonly aliran: WasteFlow;
  readonly weightKg: number;
  readonly occurredAt: string;
  readonly fractions?: FractionValues;
  readonly visibleOil?: boolean;
  readonly moistureProxy?: MoistureProxy;
  readonly photoHash?: string;
  readonly clockSkewMs?: number;
}

export interface ReGateInput {
  readonly moistureProxy?: MoistureProxy;
  readonly visibleOil?: boolean;
}