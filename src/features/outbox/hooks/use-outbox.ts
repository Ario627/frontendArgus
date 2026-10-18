import { useCallback, useMemo } from "react";
import { splitOutboxItems } from "@/features/outbox/outbox.sync";
import { useOutboxStore } from "@/features/outbox/outbox.store";

export function useOutbox() {
  const items = useOutboxStore((state) => state.items);
  const hydrated = useOutboxStore((state) => state.hydrated);
  const syncState = useOutboxStore((state) => state.syncState);
  const lastSyncAt = useOutboxStore((state) => state.lastSyncAt);
  const hydrate = useOutboxStore((state) => state.hydrate);
  const enqueue = useOutboxStore((state) => state.enqueue);
  const syncNow = useOutboxStore((state) => state.syncNow);
  const retryItem = useOutboxStore((state) => state.retryItem);
  const dropItem = useOutboxStore((state) => state.dropItem);

  const split = useMemo(() => splitOutboxItems(items), [items]);

  const positionOf = useCallback(
    (id: string): number | null => {
      const index = split.pending.findIndex((item) => item.id === id);
      return index === -1 ? null : index + 1;
    },
    [split]
  );

  return {
    hydrated,
    items,
    pending: split.pending,
    delivered: split.delivered,
    rejected: split.rejected,
    pendingCount: split.pending.length,
    needsFixCount: split.rejected.length,
    positionOf,
    syncState,
    lastSyncAt,
    hydrate,
    enqueue,
    syncNow,
    retryItem,
    dropItem
  };
}