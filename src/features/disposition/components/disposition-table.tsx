import { Chip } from "@/shared/components/ui/chip";
import { Stamp } from "@/shared/components/ui/stamp";
import { BATCH_STATUS_LABELS, type BatchStatus } from "@/shared/constants/batch.constant";
import { FLOW_LABELS } from "@/shared/constants/flow.constant";
import { cn } from "@/shared/lib/cn";
import { formatDuration, formatKgValue } from "@/shared/lib/format";
import type { DispositionQueueItem } from "@/shared/types/disposition.types";

const STATUS_TONE: Partial<Record<BatchStatus, string>> = Object.freeze({
  GAGAL_GATE: "text-kunyit",
  TERSANGKUT: "text-bata"
});

export interface DispositionTableProps {
  readonly items: readonly DispositionQueueItem[];
  readonly onOpen: (item: DispositionQueueItem) => void;
  readonly className?: string;
}

export function DispositionTable({ items, onOpen, className }: DispositionTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-garis">
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Umur</th>
            <th scope="col" className="label-cap px-2 py-2 text-right text-ink-lemah">Berat</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Aliran</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Gerbang</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Tingkat</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.batchId}
              className="relative h-11 border-b border-garis transition-colors duration-150 ease-out hover:bg-ink/5"
            >
              <td className="px-2">
                <button
                  type="button"
                  onClick={() => onOpen(item)}
                  className="font-mono text-xs tabular-nums text-ink after:absolute after:inset-0 hover:underline"
                >
                  {formatDuration(item.ageHours * 3_600_000)}
                </button>
              </td>
              <td className="px-2 text-right font-mono text-xs tabular-nums">
                {formatKgValue(item.weightKg)}
              </td>
              <td className="px-2 text-xs text-ink-lemah">{FLOW_LABELS[item.aliran]}</td>
              <td className="px-2">
                {item.gateStatus === null ? (
                  <span className="text-xs text-ink-lemah">—</span>
                ) : (
                  <Stamp verdict={item.gateStatus} />
                )}
              </td>
              <td className="px-2">
                {item.tier === null ? (
                  <span className="text-xs text-kunyit">Belum diputus</span>
                ) : (
                  <Chip className="h-6">{item.tier}</Chip>
                )}
              </td>
              <td className={cn("px-2 text-xs", STATUS_TONE[item.status] ?? "text-ink")}>
                {BATCH_STATUS_LABELS[item.status]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}