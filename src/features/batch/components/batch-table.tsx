import { Link } from "react-router";
import { Chip } from "@/shared/components/ui/chip";
import { Stamp } from "@/shared/components/ui/stamp";
import { BATCH_STATUS_LABELS, type BatchStatus } from "@/shared/constants/batch.constant";
import { FLOW_LABELS } from "@/shared/constants/flow.constant";
import { cn } from "@/shared/lib/cn";
import { formatKgValue, formatMoment } from "@/shared/lib/format";
import type { BatchDto } from "@/shared/types/batch.types";

const STATUS_TONE: Partial<Record<BatchStatus, string>> = Object.freeze({
  GAGAL_GATE: "text-kunyit",
  TERSANGKUT: "text-bata"
});

export interface BatchTableProps {
  readonly batches: readonly BatchDto[];
  readonly className?: string;
}

export function BatchTable({ batches, className }: BatchTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-garis">
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Waktu</th>
            <th scope="col" className="label-cap px-2 py-2 text-right text-ink-lemah">Berat</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Aliran</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Tingkat</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Gerbang</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Status</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch) => (
            <tr
              key={batch.id}
              className="relative h-11 border-b border-garis transition-colors duration-150 ease-out hover:bg-ink/5"
            >
              <td className="px-2">
                <Link
                  to={`/batches/${batch.id}`}
                  className="font-mono text-xs text-ink after:absolute after:inset-0 hover:underline"
                >
                  {formatMoment(batch.dikeluarkanAt)}
                </Link>
              </td>
              <td className="px-2 text-right font-mono text-xs tabular-nums">
                {formatKgValue(batch.weightKg)}
              </td>
              <td className="px-2 text-xs text-ink-lemah">{FLOW_LABELS[batch.aliran]}</td>
              <td className="px-2">
                {batch.tier === null ? (
                  <span className="text-xs text-ink-lemah">—</span>
                ) : (
                  <Chip className="h-6">{batch.tier}</Chip>
                )}
              </td>
              <td className="px-2">
                {batch.gateStatus === null ? (
                  <span className="text-xs text-ink-lemah">—</span>
                ) : (
                  <Stamp verdict={batch.gateStatus} />
                )}
              </td>
              <td className={cn("px-2 text-xs", STATUS_TONE[batch.status] ?? "text-ink")}>
                {BATCH_STATUS_LABELS[batch.status]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}