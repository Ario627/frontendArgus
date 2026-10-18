import { apiGet, apiPost } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import type { BatchDetailDto, ReGateInput } from "@/shared/types/batch.types";

export function fetchBatchDetail(batchId: string): Promise<BatchDetailDto> {
  return apiGet<BatchDetailDto>(endpoints.batches.detail(batchId));
}

export function regateBatch(batchId: string, patch: ReGateInput): Promise<BatchDetailDto> {
  return apiPost<BatchDetailDto>(endpoints.batches.gate(batchId), patch);
}