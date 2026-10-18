import { apiPost } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import type { OutboxItemType } from "@/shared/types/outbox.types";

export interface SyncRequestItem {
  readonly tipe: OutboxItemType;
  readonly batchId?: string;
  readonly payload: Record<string, unknown>;
}

export interface SyncResultItem {
  readonly clientEventId: string | null;
  readonly tipe: string;
  readonly status: "DIBUAT" | "DUPLIKAT" | "DITOLAK";
  readonly resourceId?: string;
  readonly errors?: readonly { readonly code: string; readonly field?: string }[];
}

export interface SyncBatchResponse {
  readonly results: readonly SyncResultItem[];
}

export function postSyncBatch(items: readonly SyncRequestItem[]): Promise<SyncBatchResponse> {
  return apiPost<SyncBatchResponse>(endpoints.sync.batch, { items });
}