import { apiGet, apiPost } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import { toSearchParams } from "@/shared/lib/search-params";
import type { PaginatedItems } from "@/shared/types/api.types";
import type { BatchDetailDto, BatchDto, ReGateInput } from "@/shared/types/batch.types";

export interface BatchQuery {
  readonly sppgId?: string;
  readonly status?: string;
  readonly tier?: string;
  readonly aliran?: string;
  readonly cursor?: string;
  readonly limit?: number;
}

export function fetchBatches(query: BatchQuery): Promise<PaginatedItems<BatchDto>> {
  return apiGet<PaginatedItems<BatchDto>>(
    `${endpoints.batches.list}${toSearchParams({ ...query })}`,
  );
}

export function fetchBatchDetail(batchId: string): Promise<BatchDetailDto> {
  return apiGet<BatchDetailDto>(endpoints.batches.detail(batchId));
}

export function regateBatch(batchId: string, patch: ReGateInput): Promise<BatchDetailDto> {
  return apiPost<BatchDetailDto>(endpoints.batches.gate(batchId), patch);
}