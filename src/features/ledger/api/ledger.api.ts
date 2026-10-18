import { apiGet, apiPost } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import type {
  LedgerEventDto,
  LedgerListReport,
  TransferConfirmResult,
  VerificationReport
} from "@/shared/types/ledger.types";

export function fetchLedgerEvents(batchId: string): Promise<LedgerListReport> {
  return apiGet<LedgerListReport>(endpoints.ledger.list(batchId));
}

export function fetchLedgerVerification(batchId: string): Promise<VerificationReport> {
  return apiGet<VerificationReport>(endpoints.ledger.verify(batchId));
}

export function fetchRecentLedgerEvents(): Promise<{ readonly items: readonly LedgerEventDto[] }> {
  return apiGet<{ readonly items: readonly LedgerEventDto[] }>(endpoints.ledger.recent);
}

export interface TransferConfirmInput {
  readonly clientEventId: string;
  readonly weightKg: number;
  readonly occurredAt: string;
  readonly lat?: number;
  readonly lng?: number;
  readonly photoHash?: string;
  readonly note?: string;
}

export function confirmTransfer(
  batchId: string,
  input: TransferConfirmInput
): Promise<TransferConfirmResult> {
  return apiPost<TransferConfirmResult>(endpoints.ledger.confirmTransfer(batchId), input);
}