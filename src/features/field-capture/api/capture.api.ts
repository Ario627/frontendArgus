import { apiPost } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import type {
  BatchDetailDto,
  CreateBatchInput,
  CreateBatchResult,
  ReGateInput
} from "@/shared/types/batch.types";

export function createBatch(input: CreateBatchInput): Promise<CreateBatchResult> {
  return apiPost<CreateBatchResult>(endpoints.batches.create, input);
}

export function regateBatch(batchId: string, patch: ReGateInput): Promise<BatchDetailDto> {
  return apiPost<BatchDetailDto>(endpoints.batches.gate(batchId), patch);
}