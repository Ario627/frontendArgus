import { useMemo } from "react";
import { Link } from "react-router";
import { splitOutboxItems } from "@/features/outbox/outbox.sync";
import { useOutboxStore } from "@/features/outbox/outbox.store";
import { useOnline } from "@/shared/hooks/use-online";
import { cn } from "@/shared/lib/cn";
import { formatTime } from "@/shared/lib/format";

const DOT_CLASSES: Readonly<Record<string, string>> = Object.freeze({
  daun: "bg-daun",
  kunyit: "bg-kunyit",
  bata: "bg-bata",
  netral: "bg-ink-lemah"
});

function resolveState(input: {
  readonly online: boolean;
  readonly pendingCount: number;
  readonly needsFixCount: number;
  readonly lastSyncAt: number | null;
}): { readonly tone: string; readonly label: string } | null {
  if (input.needsFixCount > 0) {
    return { tone: "bata", label: `${input.needsFixCount} perlu koreksi` };
  }
  if (input.pendingCount > 0) {
    return { tone: "kunyit", label: `${input.pendingCount} menunggu` };
  }
  if (!input.online) {
    return { tone: "kunyit", label: "Offline" };
  }
  if (input.lastSyncAt !== null) {
    return { tone: "daun", label: `Tersinkron ${formatTime(new Date(input.lastSyncAt))}` };
  }
  return null;
}

export function SyncCounter() {
  const online = useOnline();
  const items = useOutboxStore((state) => state.items);
  const lastSyncAt = useOutboxStore((state) => state.lastSyncAt);

  const counters = useMemo(() => {
    const split = splitOutboxItems(items);
    return { pendingCount: split.pending.length, needsFixCount: split.rejected.length };
  }, [items]);

  const state = resolveState({
    online,
    pendingCount: counters.pendingCount,
    needsFixCount: counters.needsFixCount,
    lastSyncAt
  });

  if (state === null) return null;

  return (
    <Link
      to="/antrean"
      className="flex min-h-9 shrink-0 items-center gap-1.5 rounded-kontrol px-1.5 transition-colors hover:bg-ink/5"
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", DOT_CLASSES[state.tone])} />
      <span aria-live="polite" className="text-xs font-medium text-ink-lemah">
        {state.label}
      </span>
    </Link>
  );
}