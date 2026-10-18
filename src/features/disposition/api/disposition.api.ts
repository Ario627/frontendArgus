import { apiGet, apiPost } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import { toSearchParams } from "@/shared/lib/search-params";
import type {
  BatchDispositionDetail,
  DispositionQueueItem,
  RunDispositionReport
} from "@/shared/types/disposition.types";

export type DispositionQueueQuery = {
  readonly date: string;
  readonly sppgId?: string;
};

export function fetchDispositionQueue(
  query: DispositionQueueQuery
): Promise<readonly DispositionQueueItem[]> {
  return apiGet<readonly DispositionQueueItem[]>(
    `${endpoints.dispositions.list}${toSearchParams(query)}`
  );
}

export function fetchBatchDisposition(batchId: string): Promise<BatchDispositionDetail> {
  return apiGet<BatchDispositionDetail>(endpoints.batches.disposition(batchId));
}

export function runDisposition(sppgId: string, date: string): Promise<RunDispositionReport> {
  return apiPost<RunDispositionReport>(endpoints.dispositions.run, { sppgId, date });
}