import {
  MATRIX_SOURCE_LABELS,
  PLAN_REASON_LABELS,
  UNASSIGNED_REASON_LABELS,
  describeSpeedSource
} from "@/features/routes/route-labels";
import { cn } from "@/shared/lib/cn";
import { formatInt, formatNumber, formatTime } from "@/shared/lib/format";
import type { RoutePlanSummary } from "@/shared/types/route.types";

export interface RouteSummaryPanelProps {
  readonly summary: RoutePlanSummary;
  readonly lowConfidence: boolean;
  readonly className?: string;
}

export function RouteSummaryPanel({ summary, lowConfidence, className }: RouteSummaryPanelProps) {
  const reason = summary.reason === null ? null : (PLAN_REASON_LABELS[summary.reason] ?? summary.reason);
  const hasIssues =
    summary.unassigned.length > 0 || summary.skippedVehicles.length > 0 || lowConfidence;

  return (
    <section className={cn("flex flex-col gap-3 rounded-kontainer border border-garis p-4", className)}>
      <h2 className="text-sm font-medium text-ink">Ringkasan perencanaan</h2>

      <dl className="flex flex-col">
        <div className="flex items-baseline justify-between gap-4 border-b border-garis py-1.5">
          <dt className="text-xs text-ink-lemah">Jendela waktu</dt>
          <dd className="font-mono text-xs tabular-nums text-ink">
            {formatTime(summary.window.start)}–{formatTime(summary.window.end)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-b border-garis py-1.5">
          <dt className="text-xs text-ink-lemah">Kecepatan</dt>
          <dd className="font-mono text-xs text-ink">{describeSpeedSource(summary.speedSource)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-b border-garis py-1.5">
          <dt className="text-xs text-ink-lemah">Jarak</dt>
          <dd className="font-mono text-xs text-ink">{MATRIX_SOURCE_LABELS[summary.speedSource] ?? "matriks"}</dd>
        </div>
        {summary.solverStats === null ? null : (
          <div className="flex items-baseline justify-between gap-4 border-b border-garis py-1.5">
            <dt className="text-xs text-ink-lemah">Solver</dt>
            <dd className="font-mono text-xs tabular-nums text-ink">
              {formatNumber(summary.solverStats.timeSeconds, 1)} dtk
              {summary.solverStats.strategy === undefined
                ? ""
                : ` · ${summary.solverStats.strategy}`}
            </dd>
          </div>
        )}
      </dl>

      {reason === null ? null : (
        <p className="rounded-kontrol border border-kunyit/40 bg-kunyit/5 px-3 py-2 text-xs text-kunyit">
          {reason}
        </p>
      )}

      {lowConfidence ? (
        <p className="text-xs text-kunyit">
          Jarak dihitung dengan garis lurus — angka km adalah perkiraan, bukan jarak jalan.
        </p>
      ) : null}

      {summary.unassigned.length === 0 ? null : (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-ink">Batch tidak masuk rute ({formatInt(summary.unassigned.length)})</p>
          <ul className="flex flex-col gap-0.5">
            {summary.unassigned.map((entry) => (
              <li key={entry.batchId} className="text-xs text-ink-lemah">
                <span className="font-mono">{entry.batchId.slice(0, 8)}</span>
                {" — "}
                {UNASSIGNED_REASON_LABELS[entry.reason] ?? entry.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.skippedVehicles.length === 0 ? null : (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-ink">Armada dilewati ({formatInt(summary.skippedVehicles.length)})</p>
          <ul className="flex flex-col gap-0.5">
            {summary.skippedVehicles.map((fleetId) => (
              <li key={fleetId} className="font-mono text-xs text-ink-lemah">
                {fleetId.slice(0, 8)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasIssues ? null : (
        <p className="text-xs text-daun">Semua batch dan armada masuk rute tanpa catatan.</p>
      )}
    </section>
  );
}