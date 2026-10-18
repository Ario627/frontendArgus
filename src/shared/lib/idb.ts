import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface CaptureDraftRecord {
  readonly id: "catat";
  readonly savedAt: number;
  readonly values: object;
}

interface ArgusDbSchema extends DBSchema {
  drafts: {
    key: string;
    value: CaptureDraftRecord;
  };
}

const DB_NAME = "argus-outbox";
const DB_VERSION = 1;
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