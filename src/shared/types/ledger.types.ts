import type { LedgerEventType } from "@/shared/constants/ledger.constant";

export interface LedgerEventDto {
  readonly id: number;
  readonly batchId: string;
  readonly type: LedgerEventType;
  readonly actorId: string | null;
  readonly deviceId: string | null;
  readonly weightKg: number | null;
  readonly lat: number | null;
  readonly lng: number | null;
  readonly photoHash: string | null;
  readonly occurredAt: string;
  readonly receivedAt: string;
  readonly payload: Record<string, unknown>;
  readonly prevHash: string | null;
  readonly hash: string;
  readonly clientEventId: string | null;
  readonly isDemo: boolean;
}