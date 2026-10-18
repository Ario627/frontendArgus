import { create } from "zustand";
import {
  LAST_SYNC_META_KEY,
  OUTBOX_DELIVERED_KEEP_MS,
  runSync
} from "@/features/outbox/outbox.sync";
import {
  deleteQueueItem,
  patchQueueItem,
  purgeDeliveredItems,
  readMetaValue,
  readQueueItems,
  writeQueueItem
} from "@/shared/lib/outbox-db";
import type { OutboxEnqueueInput, OutboxItem } from "@/shared/types/outbox.types";

export interface OutboxState {
  readonly hydrated: boolean;
  readonly items: readonly OutboxItem[];
  readonly syncState: "idle" | "syncing";
  readonly lastSyncAt: number | null;
  hydrate: () => Promise<void>;
  enqueue: (input: OutboxEnqueueInput) => Promise<OutboxItem>;
  syncNow: () => Promise<void>;
  requestSyncSoon: () => void;
  retryItem: (id: string) => Promise<void>;
  dropItem: (id: string) => Promise<void>;
}

const SYNC_SOON_DELAY_MS = 1200;

let soonTimer: ReturnType<typeof setTimeout> | null = null;

async function readLastSyncAt(): Promise<number | null> {
  const value = await readMetaValue(LAST_SYNC_META_KEY);
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

async function loadSnapshot(): Promise<{
  items: readonly OutboxItem[];
  lastSyncAt: number | null;
}> {
  await purgeDeliveredItems(Date.now() - OUTBOX_DELIVERED_KEEP_MS);
  const [items, lastSyncAt] = await Promise.all([readQueueItems(), readLastSyncAt()]);
  return { items, lastSyncAt };
}

export const useOutboxStore = create<OutboxState>()((set, get) => {
  const refresh = async (): Promise<void> => {
    const snapshot = await loadSnapshot();
    set(snapshot);
  };

  return {
    hydrated: false,
    items: [],
    syncState: "idle",
    lastSyncAt: null,
    hydrate: async () => {
      try {
        await refresh();
      } catch {
        return;
      } finally {
        set({ hydrated: true });
      }
    },
    enqueue: async (input) => {
      const rawId = input.payload["clientEventId"];
      if (typeof rawId !== "string" || rawId.length === 0) {
        throw new Error("Payload antrean wajib memuat clientEventId");
      }
      const item: OutboxItem = {
        id: rawId,
        tipe: input.tipe,
        payload: input.payload,
        createdAt: Date.now(),
        attempts: 0,
        status: "menunggu",
        ...(input.refId === undefined ? {} : { refId: input.refId }),
        ...(input.photoBlobId === undefined ? {} : { photoBlobId: input.photoBlobId })
      };
      await writeQueueItem(item);
      await refresh();
      get().requestSyncSoon();
      return item;
    },
    syncNow: async () => {
      if (get().syncState === "syncing") return;
      if (!navigator.onLine) return;
      set({ syncState: "syncing" });
      try {
        await runSync();
      } finally {
        await refresh().catch(() => undefined);
        set({ syncState: "idle" });
      }
    },
    requestSyncSoon: () => {
      if (soonTimer !== null) clearTimeout(soonTimer);
      soonTimer = setTimeout(() => {
        soonTimer = null;
        void useOutboxStore.getState().syncNow();
      }, SYNC_SOON_DELAY_MS);
    },
    retryItem: async (id) => {
      await patchQueueItem(id, { status: "menunggu", nextAttemptAt: 0 });
      await refresh();
      get().requestSyncSoon();
    },
    dropItem: async (id) => {
      await deleteQueueItem(id);
      await refresh();
    }
  };
});