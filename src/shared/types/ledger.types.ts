import type { AnomalyKind, AnomalySeverity } from "@/shared/constants/anomaly.constant";
import type {
  AppendableLedgerEventType,
  LedgerEventType,
  TransferSide
} from "@/shared/constants/ledger.constant";

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

export type TransferStatus = "SAH" | "MENUNGGU_KONFIRMASI";

export interface TransferEvaluation {
  readonly status: TransferStatus | null;
  readonly senderKg: number | null;
  readonly receiverKg: number | null;
  readonly handedOverKg: number | null;
  readonly diffKg: number | null;
  readonly withinTolerance: boolean | null;
  readonly notes: readonly string[];
}

export interface LedgerListReport {
  readonly batchId: string;
  readonly transferStatus: TransferStatus | null;
  readonly transfer: TransferEvaluation;
  readonly events: readonly LedgerEventDto[];
}

export interface MassBalanceReport {
  readonly expectedMinKg: number;
  readonly expectedMaxKg: number;
  readonly ok: boolean;
  readonly deltaPercent: number;
  readonly severity: "PERHATIAN" | "KRITIS" | null;
  readonly handedOverKg: number;
  readonly receivedKg: number;
  readonly parameter: {
    readonly susutWajar: number;
    readonly toleransi: number;
    readonly susutWajarSumber: string;
    readonly toleransiSumber: string;
  };
}

export interface SpoilageReport {
  readonly maxAgeHours: number | null;
  readonly elapsedHours: number | null;
  readonly late: boolean | null;
}

export interface AnomalyReport {
  readonly jenis: AnomalyKind;
  readonly tingkat: AnomalySeverity;
  readonly detail: Record<string, unknown>;
}

export interface ChainIssueReport {
  readonly index: number;
  readonly eventId: string;
  readonly reason: "HASH_MISMATCH" | "PREV_LINK_MISMATCH";
}

export interface VerificationReport {
  readonly batchId: string;
  readonly chainOk: boolean;
  readonly eventsChecked: number;
  readonly chainIssue: ChainIssueReport | null;
  readonly transferStatus: TransferStatus | null;
  readonly transfer: TransferEvaluation;
  readonly massBalance: MassBalanceReport | null;
  readonly spoilage: SpoilageReport;
  readonly anomalies: readonly AnomalyReport[];
}

export interface AppendEventInput {
  readonly clientEventId: string;
  readonly tipe: AppendableLedgerEventType;
  readonly weightKg?: number;
  readonly occurredAt: string;
  readonly lat?: number;
  readonly lng?: number;
  readonly photoHash?: string;
  readonly note?: string;
  readonly sisi?: TransferSide;
  readonly refEventId?: number;
}

export interface AppendEventResult {
  readonly event: LedgerEventDto;
  readonly duplicate: boolean;
}