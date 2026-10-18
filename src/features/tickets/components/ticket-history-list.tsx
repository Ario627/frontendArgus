import { Chip } from "@/shared/components/ui/chip";
import { TICKET_STATUS_LABELS } from "@/shared/constants/ticket.constant";
import { STATUS_CHIP_CLASSES } from "@/features/tickets/ticket-view";
import { formatMoment } from "@/shared/lib/format";
import type { TicketEventDto } from "@/shared/types/ticket.types";

export interface TicketHistoryListProps {
  readonly events: readonly TicketEventDto[];
}

export function TicketHistoryList({ events }: TicketHistoryListProps) {
  if (events.length === 0) {
    return <p className="text-sm text-ink-lemah">Belum ada riwayat moderasi.</p>;
  }
  return (
    <ul className="flex flex-col">
      {events.map((event) => (
        <li key={event.id} className="flex flex-col gap-1 border-b border-garis py-2.5 last:border-b-0">
          <div className="flex flex-wrap items-center gap-2">
            <Chip className={`h-6 ${STATUS_CHIP_CLASSES[event.keStatus]}`}>
              {TICKET_STATUS_LABELS[event.keStatus]}
            </Chip>
            <span className="text-xs text-ink-lemah">
              {event.dariStatus === null
                ? "dibuat"
                : `dari ${TICKET_STATUS_LABELS[event.dariStatus]}`}
            </span>
            <span className="ml-auto font-mono text-2xs text-ink-lemah">{formatMoment(event.ts)}</span>
          </div>
          {event.catatan === null || event.catatan.trim() === "" ? null : (
            <p className="text-sm text-ink">{event.catatan}</p>
          )}
        </li>
      ))}
    </ul>
  );
}