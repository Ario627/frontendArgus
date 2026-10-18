import { Link } from "react-router";
import { Chip } from "@/shared/components/ui/chip";
import { TICKET_KIND_LABELS, TICKET_STATUS_LABELS } from "@/shared/constants/ticket.constant";
import { STATUS_CHIP_CLASSES, ageHoursOf, isOpenTicketStatus, AGE_WARNING_HOURS } from "@/features/tickets/ticket-view";
import { cn } from "@/shared/lib/cn";
import { formatDuration, formatInt } from "@/shared/lib/format";
import type { TicketDto } from "@/shared/types/ticket.types";

export interface TicketTableProps {
  readonly tickets: readonly TicketDto[];
  readonly className?: string;
}

export function TicketTable({ tickets, className }: TicketTableProps) {
  const now = new Date();
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-garis">
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Umur</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Jenis</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Laporan</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Status</th>
            <th scope="col" className="label-cap px-2 py-2 text-right text-ink-lemah">Skor</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => {
            const ageHours = ageHoursOf(ticket.createdAt, now);
            const overdue = isOpenTicketStatus(ticket.status) && ageHours > AGE_WARNING_HOURS;
            return (
              <tr
                key={ticket.id}
                className="relative h-11 border-b border-garis transition-colors duration-150 ease-out hover:bg-ink/5"
              >
                <td className="px-2">
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className={cn(
                      "font-mono text-xs tabular-nums after:absolute after:inset-0 hover:underline",
                      overdue ? "text-kunyit" : "text-ink"
                    )}
                  >
                    {formatDuration(ageHours * 3_600_000)}
                  </Link>
                </td>
                <td className="px-2 text-xs text-ink-lemah">{TICKET_KIND_LABELS[ticket.jenis]}</td>
                <td className="max-w-72 px-2">
                  <span className="block truncate text-sm text-ink">{ticket.deskripsi}</span>
                </td>
                <td className="px-2">
                  <Chip className={cn("h-6", STATUS_CHIP_CLASSES[ticket.status])}>
                    {TICKET_STATUS_LABELS[ticket.status]}
                  </Chip>
                </td>
                <td className="px-2 text-right font-mono text-xs tabular-nums text-ink-lemah">
                  {ticket.skorRisiko === null ? "—" : formatInt(ticket.skorRisiko)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}