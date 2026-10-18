import { isApiError } from "@/api/api-error";
import { postSyncBatch, type SyncRequestItem, type SyncResultItem } from "@/features/outbox/api/sync.api";
import { env } from "@/shared/lib/env";
import { patchQueueItem, readQueueItems, writeMetaValue } from "@/shared/lib/outbox-db";
import type { OutboxItem } from "@/shared/types/outbox.types";

export const LAST_SYNC_META_KEY = "lastSyncAt";
export const OUTBOX_DELIVERED_KEEP_MS = 7 * 24 * 60 * 60 * 1000;

const BACKOFF_BASE_MS = 30_000;
const BACKOFF_CAP_MS = 10 * 60 * 1000;

export type SyncRunResult = "offline" | "idle" | "ok" | "partial" | "failed";

export interface OutboxSplit {
  readonly pending: readonly OutboxItem[];
  readonly delivered: readonly OutboxItem[];
  readonly rejected: readonly OutboxItem[];
}

export function backoffMs(attempts: number): number {
  const exponent = Math.max(0, attempts - 1);
  return Math.min(BACKOFF_BASE_MS * 2 ** exponent, BACKOFF_CAP_MS);
}

export function isOutboxItemDue(item: OutboxItem, now: number): boolean {
  return item.status === "menunggu" && (item.nextAttemptAt ?? 0) <= now;
}

export function splitOutboxItems(items: readonly OutboxItem[]): OutboxSplit {
  const pending: OutboxItem[] = [];
  const delivered: OutboxItem[] = [];
  const rejected: OutboxItem[] = [];
  for (const item of items) {
    if (item.status === "menunggu") pending.push(item);
    else if (item.status === "terkirim") delivered.push(item);
    else rejected.push(item);
  }
  delivered.sort((a, b) => (b.deliveredAt ?? b.createdAt) - (a.deliveredAt ?? a.createdAt));
  return { pending, delivered, rejected };
}

function selectDueItems(items: readonly OutboxItem[], now: number): readonly OutboxItem[] {
  return items.filter((item) => isOutboxItemDue(item, now)).slice(0, env.VITE_SYNC_BATCH_MAX);
}

function toRequestItem(item: OutboxItem): SyncRequestItem {
  return {
    tipe: item.tipe,
    payload: item.payload,
    ...(item.refId === undefined ? {} : { batchId: item.refId })
  };
}

function markDelivered(item: OutboxItem, result: SyncResultItem): Promise<OutboxItem | null> {
  return patchQueueItem(item.id, {
    status: "terkirim",
    attempts: item.attempts + 1,
    deliveredAt: Date.now(),
    resultStatus: result.status === "DUPLIKAT" ? "DUPLIKAT" : "DIBUAT",
    ...(result.resourceId === undefined ? {} : { resourceId: result.resourceId })
  });
}

function markRejected(item: OutboxItem, result: SyncResultItem): Promise<OutboxItem | null> {
  return patchQueueItem(item.id, {
    status: "ditolak",
    attempts: item.attempts + 1,
    errors: result.errors ?? [],
    lastErrorCode: result.errors?.[0]?.code ?? "SYNC_REJECTED"
  });
}

function markRetry(item: OutboxItem, errorCode: string): Promise<OutboxItem | null> {
  const attempts = item.attempts + 1;
  return patchQueueItem(item.id, {
    attempts,
    lastErrorCode: errorCode,
    nextAttemptAt: Date.now() + backoffMs(attempts)
  });
}

let running: Promise<SyncRunResult> | null = null;

async function execute(): Promise<SyncRunResult> {
  if (!navigator.onLine) return "offline";
  const now = Date.now();
  const batch = selectDueItems(await readQueueItems(), now);
  if (batch.length === 0) return "idle";

  try {
    const response = await postSyncBatch(batch.map(toRequestItem));
    const byClientId = new Map<string, SyncResultItem>();
    for (const result of response.results) {
      if (result.clientEventId !== null) byClientId.set(result.clientEventId, result);
    }
    let rejected = 0;
    for (const item of batch) {
      const result = byClientId.get(item.id);
      if (result === undefined) {
        await markRetry(item, "SYNC_NO_RESULT");
        continue;
      }
      if (result.status === "DITOLAK") {
        rejected += 1;
        await markRejected(item, result);
        continue;
      }
      await markDelivered(item, result);
    }
    await writeMetaValue(LAST_SYNC_META_KEY, Date.now());
    return rejected > 0 ? "partial" : "ok";
  } catch (error) {
    const code = isApiError(error) ? error.code : "NETWORK_ERROR";
    for (const item of batch) {
      await markRetry(item, code);
    }
    return "failed";
  }
}

export function runSync(): Promise<SyncRunResult> {
  if (running !== null) return running;
  running = execute().finally(() => {
    running = null;
  });
  return running;
}