import { apiGet, apiPost } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import type {
  AutoDispatchResult,
  DispatchAssignment,
  DispatchBoard
} from "@/shared/types/dispatch.types";

export function fetchDispatchBoard(sppgId: string | null): Promise<DispatchBoard> {
  const suffix = sppgId === null ? "" : `?sppgId=${encodeURIComponent(sppgId)}`;
  return apiGet<DispatchBoard>(`${endpoints.dispatch.board}${suffix}`);
}

export interface AssignBatchInput {
  readonly batchId: string;
  readonly fleetId: string;
}

export function assignBatch(input: AssignBatchInput): Promise<DispatchAssignment> {
  return apiPost<DispatchAssignment>(endpoints.dispatch.assign, input);
}

export function runAutoDispatch(sppgId: string | null): Promise<AutoDispatchResult> {
  const suffix = sppgId === null ? "" : `?sppgId=${encodeURIComponent(sppgId)}`;
  return apiPost<AutoDispatchResult>(`${endpoints.dispatch.auto}${suffix}`);
}
