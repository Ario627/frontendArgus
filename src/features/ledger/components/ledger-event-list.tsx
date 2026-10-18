import { HashTag } from "@/shared/components/data/hash-tag";
import { KgValue } from "@/shared/components/data/kg-value";
import { LEDGER_EVENT_LABELS } from "@/shared/constants/ledger.constant";
import { readTransferSide } from "@/features/ledger/ledger-format";
import { formatTime } from "@/shared/lib/format";
import type { LedgerEventDto } from "@/shared/types/ledger.types";

function readNote(payload: Record<string, unknown>): string | null {
  const note = payload["catatan"];
  return typeof note === "string" && note.length > 0 ? note : null;
}

export interface LedgerEventListProps {
  readonly events: readonly LedgerEventDto[];
}

export function LedgerEventList({ events }: LedgerEventListProps) {
  if (events.length === 0) {
    return <p className="text-sm text-ink-lemah">Belum ada peristiwa tercatat.</p>;
  }
  return (
    <ul className="flex flex-col">
      {events.map((event) => {
        const side = event.type === "SERAH_TERIMA" ? readTransferSide(event.payload) : null;
        const note = readNote(event.payload);
        return (
          <li key={event.id} className="flex flex-col gap-1 border-b border-garis py-2.5 last:border-b-0">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-ink">
                {LEDGER_EVENT_LABELS[event.type]}
                {side === null ? "" : ` · ${side === "KIRIM" ? "kirim" : "terima"}`}
              </span>
              <span className="shrink-0 font-mono text-xs tabular-nums text-ink-lemah">
                {formatTime(event.occurredAt)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-lemah">
              {event.weightKg === null ? null : (
                <KgValue
                  value={event.weightKg}
                  source={event.deviceId === null ? "manual" : "device"}
                  className="text-xs text-ink"
                />
              )}
              <span>{event.deviceId === null ? "dicatat petugas" : "dari perangkat"}</span>
              {note === null ? null : <span className="min-w-0 truncate">{note}</span>}
              <HashTag hash={event.hash} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}