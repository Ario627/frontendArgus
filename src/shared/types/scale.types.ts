import type { LedgerEventDto } from "@/shared/types/ledger.types";

export interface ScalePendingDto {
  readonly id: string;
  readonly deviceId: string;
  readonly sppgId: string;
  readonly beratKg: number;
  readonly occurredAt: string;
  readonly receivedAt: string;
  readonly ageSeconds: number;
  readonly kedaluwarsa: boolean;
  readonly dipakaiBatchId: string | null;
  readonly ditautkanAt: string | null;
}

export interface ScaleLinkResultDto {
  readonly pending: ScalePendingDto;
  readonly event: LedgerEventDto;
  readonly duplicate: boolean;
}

export interface LinkScaleInput {
  readonly batchId: string;
}
