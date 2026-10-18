import { useState } from "react";
import { ConfirmDialog } from "@/shared/components/ui/dialog";
import { describeOutboxError, describeOutboxItem } from "@/features/outbox/outbox.presenter";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/cn";
import { formatTime } from "@/shared/lib/format";
import type { OutboxItem } from "@/shared/types/outbox.types";

export interface OutboxItemRowProps {
  readonly item: OutboxItem;
  readonly position: number | null;
  readonly syncing: boolean;
  readonly onRetry: (id: string) => void;
  readonly onDrop: (id: string) => void;
}

const STATUS_TONE_CLASSES: Readonly<Record<OutboxItem["status"], string>> = Object.freeze({
  menunggu: "text-ink-lemah",
  terkirim: "text-daun",
  ditolak: "text-bata"
});

export function OutboxItemRow({ item, position, syncing, onRetry, onDrop }: OutboxItemRowProps) {
  const [dropOpen, setDropOpen] = useState(false);
  const presentation = describeOutboxItem(item);

  const statusText = (() => {
    if (item.status === "menunggu") {
      const base = position === null ? "Menunggu sinkron" : `Menunggu sinkron (posisi ${position})`;
      if (item.lastErrorCode !== undefined) return `${base} — gagal terkirim, akan dicoba lagi`;
      return base;
    }
    if (item.status === "terkirim") {
      const time = item.deliveredAt === undefined ? "" : ` ${formatTime(new Date(item.deliveredAt))}`;
      return item.resultStatus === "DUPLIKAT" ? `Terkirim${time} — sudah tersimpan sebelumnya` : `Terkirim${time}`;
    }
    return "Ditolak server";
  })();

  return (
    <div className="flex flex-col gap-2 border-b border-garis py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base text-ink">{presentation.title}</p>
          <p className="text-xs text-ink-lemah">{presentation.moment}</p>
        </div>
        <p className={cn("shrink-0 text-xs font-medium", STATUS_TONE_CLASSES[item.status])}>
          {statusText}
        </p>
      </div>

      {item.status === "ditolak" && item.errors !== undefined && item.errors.length > 0 ? (
        <ul className="flex flex-col gap-0.5">
          {item.errors.slice(0, 3).map((error) => (
            <li key={`${error.code}-${error.field ?? ""}`} className="text-sm text-bata">
              {describeOutboxError(error)}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex gap-2">
        {item.status === "menunggu" ? (
          <Button variant="ghost" size="sm" disabled={syncing} onClick={() => onRetry(item.id)}>
            Kirim ulang
          </Button>
        ) : null}
        {item.status === "ditolak" ? (
          <Button variant="danger" size="sm" onClick={() => setDropOpen(true)}>
            Buang catatan
          </Button>
        ) : null}
      </div>

      <ConfirmDialog
        open={dropOpen}
        onOpenChange={setDropOpen}
        title="Buang catatan ini?"
        description="Catatan dihapus dari perangkat dan tidak akan terkirim. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Buang catatan"
        tone="bahaya"
        typedWord="BUANG"
        onConfirm={() => {
          setDropOpen(false);
          onDrop(item.id);
        }}
      />
    </div>
  );
}