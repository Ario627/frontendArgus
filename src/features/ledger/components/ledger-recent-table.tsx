import { useMemo } from "react";
import { Link } from "react-router";
import { HashTag } from "@/shared/components/data/hash-tag";
import { KgValue } from "@/shared/components/data/kg-value";
import { readTransferSide } from "@/features/ledger/ledger-format";
import { LEDGER_EVENT_LABELS } from "@/shared/constants/ledger.constant";
import { cn } from "@/shared/lib/cn";
import { formatDate, formatInt, formatTime } from "@/shared/lib/format";
import type { LedgerEventDto } from "@/shared/types/ledger.types";

interface LedgerDayGroup {
  readonly key: string;
  readonly label: string;
  readonly events: readonly LedgerEventDto[];
}

function groupByDay(events: readonly LedgerEventDto[]): readonly LedgerDayGroup[] {
  const buckets = new Map<string, LedgerEventDto[]>();
  for (const event of events) {
    const date = new Date(event.occurredAt);
    const key = Number.isNaN(date.getTime()) ? "tidak-dikenal" : date.toDateString();
    const bucket = buckets.get(key);
    if (bucket === undefined) buckets.set(key, [event]);
    else bucket.push(event);
  }
  const groups: LedgerDayGroup[] = [];
  for (const [key, dayEvents] of buckets) {
    const first = dayEvents[0];
    groups.push({
      key,
      label: first === undefined ? "Tanggal tidak dikenal" : formatDate(first.occurredAt),
      events: dayEvents
    });
  }
  return groups;
}

function stageLabel(event: LedgerEventDto): string {
  if (event.type !== "SERAH_TERIMA") return LEDGER_EVENT_LABELS[event.type];
  const side = readTransferSide(event.payload);
  if (side === null) return LEDGER_EVENT_LABELS.SERAH_TERIMA;
  return `${LEDGER_EVENT_LABELS.SERAH_TERIMA} · ${side === "KIRIM" ? "kirim" : "terima"}`;
}

export interface LedgerRecentTableProps {
  readonly events: readonly LedgerEventDto[];
  readonly className?: string;
}

export function LedgerRecentTable({ events, className }: LedgerRecentTableProps) {
  const groups = useMemo(() => groupByDay(events), [events]);

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-garis">
            <th scope="col" className="label-cap w-14 px-2 py-2 text-left text-ink-lemah">
              Jam
            </th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">
              Tahap
            </th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">
              Batch
            </th>
            <th scope="col" className="label-cap px-2 py-2 text-right text-ink-lemah">
              Berat
            </th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">
              Segel
            </th>
          </tr>
        </thead>
        {groups.map((group) => (
          <tbody key={group.key}>
            <tr>
              <td
                colSpan={5}
                className="label-cap border-b border-garis bg-ink/5 px-2 py-1.5 text-ink-lemah"
              >
                {group.label} · {formatInt(group.events.length)} peristiwa
              </td>
            </tr>
            {group.events.map((event) => (
              <tr
                key={event.id}
                className="h-10 border-b border-garis transition-colors duration-150 ease-out hover:bg-ink/5"
              >
                <td className="px-2 font-mono text-2xs tabular-nums text-ink-lemah">
                  {formatTime(event.occurredAt)}
                </td>
                <td className="px-2 text-xs text-ink">{stageLabel(event)}</td>
                <td className="px-2">
                  <Link
                    to={`/batches/${event.batchId}`}
                    className="font-mono text-2xs text-biru-tinta hover:underline"
                  >
                    {event.batchId.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-2 text-right">
                  {event.weightKg === null ? (
                    <span className="text-xs text-ink-lemah">—</span>
                  ) : (
                    <KgValue
                      value={event.weightKg}
                      source={event.deviceId === null ? "manual" : "device"}
                      className="text-xs"
                    />
                  )}
                </td>
                <td className="px-2">
                  <HashTag hash={event.hash} />
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}