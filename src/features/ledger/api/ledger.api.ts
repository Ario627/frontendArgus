import { apiGet } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import type { LedgerListReport, VerificationReport } from "@/shared/types/ledger.types";

export function fetchLedgerEvents(batchId: string): Promise<LedgerListReport> {
  return apiGet<LedgerListReport>(endpoints.ledger.list(batchId));
}

export function fetchLedgerVerification(batchId: string): Promise<VerificationReport> {
  return apiGet<VerificationReport>(endpoints.ledger.verify(batchId));
}