import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { OutboxItem, OutboxStatus } from "@/shared/types/outbox.types";

export interface CaptureDraftRecord {
  readonly id: "catat";
  readonly savedAt: number;
  readonly values: object;
}

interface MetaRecord {
  readonly key: string;
  readonly value: unknown;
}

interface MediaRecord {
  readonly id: string;
  readonly blob: Blob;
  readonly createdAt: number;
}

interface ArgusDbSchema extends DBSchema {
  drafts: { key: string; value: CaptureDraftRecord };
  queue: {
    key: string;
    value: OutboxItem;
    indexes: { by_created: number; by_status: string };
  };
  media: { key: string; value: MediaRecord };
  meta: { key: string; value: MetaRecord };
}

const DB_NAME = "argus-outbox";
const DB_VERSION = 2;
const DRAFT_ID = "catat";
const DRAFT_MAX_AGE_MS = 48 * 60 * 60 * 1000;

let dbPromise: Promise<IDBPDatabase<ArgusDbSchema>> | null = null;

function getDb(): Promise<IDBPDatabase<ArgusDbSchema>> {
  if (dbPromise === null) {
    dbPromise = openDB<ArgusDbSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("drafts")) {
          db.createObjectStore("drafts", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("queue")) {
          const queue = db.createObjectStore("queue", { keyPath: "id" });
          queue.createIndex("by_created", "createdAt");
          queue.createIndex("by_status", "status");
        }
        if (!db.objectStoreNames.contains("media")) {
          db.createObjectStore("media", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta", { keyPath: "key" });
        }
      }
    });
  }
  return dbPromise;
}

function isDraftShape(value: unknown): value is CaptureDraftRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  if (typeof record["savedAt"] !== "number") return false;
  return typeof record["values"] === "object" && record["values"] !== null;
}

export async function readCaptureDraft(): Promise<CaptureDraftRecord | null> {
  try {
    const db = await getDb();
    const record = await db.get("drafts", DRAFT_ID);
    if (record === undefined) return null;
    if (!isDraftShape(record)) return null;
    if (Date.now() - record.savedAt > DRAFT_MAX_AGE_MS) {
      await db.delete("drafts", DRAFT_ID);
      return null;
    }
    return record;
  } catch {
    return null;
  }
}

export async function writeCaptureDraft(values: object): Promise<void> {
  try {
    const db = await getDb();
    await db.put("drafts", { id: DRAFT_ID, savedAt: Date.now(), values });
  } catch {
    return;
  }
}

export async function clearCaptureDraft(): Promise<void> {
  try {
    const db = await getDb();
    await db.delete("drafts", DRAFT_ID);
  } catch {
    return;
  }
}

export async function readQueueItems(): Promise<OutboxItem[]> {
  const db = await getDb();
  return db.getAllFromIndex("queue", "by_created");
}

export async function writeQueueItem(item: OutboxItem): Promise<void> {
  const db = await getDb();
  await db.put("queue", item);
}

export async function patchQueueItem(
  id: string,
  patch: Partial<OutboxItem>
): Promise<OutboxItem | null> {
  const db = await getDb();
  const tx = db.transaction("queue", "readwrite");
  const current = await tx.store.get(id);
  if (current === undefined) {
    await tx.done;
    return null;
  }
  const next: OutboxItem = { ...current, ...patch };
  await tx.store.put(next);
  await tx.done;
  return next;
}

export async function deleteQueueItem(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("queue", id);
}

export async function purgeDeliveredItems(cutoffMs: number): Promise<number> {
  const db = await getDb();
  const tx = db.transaction("queue", "readwrite");
  let removed = 0;
  const delivered = await tx.store.index("by_status").getAll("terkirim" as OutboxStatus);
  for (const item of delivered) {
    if (item.deliveredAt !== undefined && item.deliveredAt < cutoffMs) {
      await tx.store.delete(item.id);
      removed += 1;
    }
  }
  await tx.done;
  return removed;
}

export async function readMetaValue(key: string): Promise<unknown> {
  const db = await getDb();
  const record = await db.get("meta", key);
  return record === undefined ? null : record.value;
}

export async function writeMetaValue(key: string, value: unknown): Promise<void> {
  const db = await getDb();
  await db.put("meta", { key, value });
}