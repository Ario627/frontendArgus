import { useMemo } from "react";
import { isApiError } from "@/api/api-error";
import {
  CANDIDATE_NOTE_LABELS,
  DECISION_REASON_LABELS,
  INELIGIBILITY_LABELS,
  INELIGIBILITY_TONES,
  PARAMETER_LABELS
} from "@/features/disposition/disposition-labels";
import {
  parseDispositionDetail,
  type CandidateScoreView,
  type DispositionParametersView
} from "@/features/disposition/disposition-detail";
import { useBatchDisposition } from "@/features/disposition/hooks/use-batch-disposition";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { Chip } from "@/shared/components/ui/chip";
import { Sheet } from "@/shared/components/ui/sheet";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { Stamp } from "@/shared/components/ui/stamp";
import { BATCH_STATUS_LABELS } from "@/shared/constants/batch.constant";
import { FLOW_LABELS } from "@/shared/constants/flow.constant";
import { TIER_LABELS } from "@/shared/constants/tier.constant";
import { cn } from "@/shared/lib/cn";
import {
  formatDuration,
  formatKgValue,
  formatNumber,
  formatPercent,
  formatRupiah,
  formatTime
} from "@/shared/lib/format";
import type { DispositionQueueItem } from "@/shared/types/disposition.types";

function sortCandidates(candidates: readonly CandidateScoreView[]): readonly CandidateScoreView[] {
  return [...candidates].sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    if (a.score === null || b.score === null) return 0;
    return a.score - b.score;
  });
}

function formatRisk(risk: number): string {
  return risk < 0 ? `−${formatRupiah(-risk)}` : `+${formatRupiah(risk)}`;
}

interface CandidateRowProps {
  readonly candidate: CandidateScoreView;
  readonly chosen: boolean;
}

function CandidateRow({ candidate, chosen }: CandidateRowProps) {
  const breakdown = candidate.breakdown;
  return (
    <li
      className={cn(
        "flex flex-col gap-1.5 border-b border-garis py-3 last:border-b-0",
        chosen && "border-l-2 border-l-biru-tinta pl-3"
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Chip className="h-6">{candidate.tier}</Chip>
          <span className="truncate text-sm text-ink">{candidate.nama}</span>
          {chosen ? <span className="shrink-0 text-2xs text-biru-tinta">dipilih</span> : null}
        </div>
        {candidate.score === null ? (
          <span className="shrink-0 text-xs text-ink-lemah">tidak dihitung</span>
        ) : (
          <span
            className={cn(
              "shrink-0 font-mono text-sm tabular-nums",
              chosen ? "text-ink" : "text-ink-lemah"
            )}
          >
            {formatRupiah(candidate.score)}
          </span>
        )}
      </div>
      {candidate.eligible && breakdown !== null ? (
        <p className="flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-2xs text-ink-lemah">
          <span>biaya {formatRupiah(breakdown.cost)}</span>
          <span>nilai −{formatRupiah(breakdown.value)}</span>
          <span>risiko {formatRisk(breakdown.risk)}</span>
        </p>
      ) : null}
      {candidate.ineligibility === null ? null : (
        <p
          className={cn(
            "text-xs",
            INELIGIBILITY_TONES[candidate.ineligibility] ?? "text-ink-lemah"
          )}
        >
          {INELIGIBILITY_LABELS[candidate.ineligibility] ?? candidate.ineligibility}
        </p>
      )}
      {candidate.notes.length === 0 ? null : (
        <p className="text-2xs text-kunyit">
          {candidate.notes.map((note) => CANDIDATE_NOTE_LABELS[note] ?? note).join(" · ")}
        </p>
      )}
    </li>
  );
}

function buildParameterRows(params: DispositionParametersView): readonly { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  if (params.biayaPerKm !== null) {
    rows.push({ label: PARAMETER_LABELS.biayaPerKm ?? "", value: formatRupiah(params.biayaPerKm) });
  }
  if (params.faktorMuat !== null) {
    rows.push({ label: PARAMETER_LABELS.faktorMuat ?? "", value: formatNumber(params.faktorMuat, 2) });
  }
  if (params.biayaTolak !== null) {
    rows.push({
      label: PARAMETER_LABELS.biayaTolak ?? "",
      value: formatPercent(params.biayaTolak * 100, 0)
    });
  }
  if (params.penaltiUmurPerJam !== null) {
    rows.push({
      label: PARAMETER_LABELS.penaltiUmurPerJam ?? "",
      value: formatRupiah(params.penaltiUmurPerJam)
    });
  }
  if (params.kecepatanKotaJam !== null) {
    rows.push({
      label: PARAMETER_LABELS.kecepatanKotaJam ?? "",
      value: `${formatNumber(params.kecepatanKotaJam, 0)} km/j`
    });
  }
  return rows;
}

export interface CandidateScoreSheetProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly item: DispositionQueueItem | null;
}

export function CandidateScoreSheet({ open, onOpenChange, item }: CandidateScoreSheetProps) {
  const query = useBatchDisposition(open && item !== null ? item.batchId : null);
  const view = useMemo(
    () => (query.data === undefined ? null : parseDispositionDetail(query.data.detail)),
    [query.data]
  );
  const sorted = useMemo(() => (view === null ? [] : sortCandidates(view.candidates)), [view]);
  const apiError = isApiError(query.error) ? query.error : null;

  const description =
    item === null
      ? ""
      : `${FLOW_LABELS[item.aliran]} · ${formatKgValue(item.weightKg)} kg · umur ${formatDuration(item.ageHours * 3_600_000)}`;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Rincian putusan"
      description={description}
    >
      {query.isPending ? <SkeletonList rows={4} /> : null}

      {query.isError ? (
        <ErrorState
          description={apiError?.message ?? "Periksa jaringan lalu coba lagi."}
          requestId={apiError?.requestId}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {view === null && !query.isPending && !query.isError ? (
        <p className="text-sm text-ink-lemah">Rincian putusan belum tersedia untuk batch ini.</p>
      ) : null}

      {view === null ? null : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3 border-b border-garis pb-4">
            {item?.gateStatus === undefined || item.gateStatus === null ? null : (
              <Stamp verdict={item.gateStatus} />
            )}
            <span className="text-sm text-ink-lemah">
              {item === null ? "" : BATCH_STATUS_LABELS[item.status]}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 border-b border-garis pb-4">
            <div className="flex flex-wrap items-center gap-2">
              {view.chosenTier === null ? null : <Chip className="h-7">{view.chosenTier}</Chip>}
              <span className="text-sm font-medium text-ink">
                {view.chosenTier === null ? "Belum diputus" : TIER_LABELS[view.chosenTier]}
              </span>
            </div>
            {view.chosenFacilityNama === null ? null : (
              <p className="text-sm text-ink-lemah">{view.chosenFacilityNama}</p>
            )}
            {view.reason === null ? null : (
              <p className="text-xs text-ink-lemah">
                {DECISION_REASON_LABELS[view.reason] ?? view.reason}
              </p>
            )}
            {view.decidedAt === null ? null : (
              <p className="font-mono text-2xs text-ink-lemah">diputus {formatTime(view.decidedAt)}</p>
            )}
          </div>

          {view.missingParameters.length === 0 ? null : (
            <div className="rounded-kontainer border border-kunyit/40 bg-kunyit/5 px-3 py-2">
              <p className="text-xs text-kunyit">
                Parameter berikut belum dikalibrasi — batch memakai jalur aman T4:
              </p>
              <p className="mt-1 flex flex-wrap gap-1.5">
                {view.missingParameters.map((key) => (
                  <span
                    key={key}
                    className="rounded-kontrol border border-kunyit/40 px-1.5 font-mono text-2xs text-kunyit"
                  >
                    {key}
                  </span>
                ))}
              </p>
            </div>
          )}

          <section className="flex flex-col">
            <h3 className="pb-1 text-sm font-medium text-ink">
              Kandidat
              <span className="ml-2 font-mono text-xs text-ink-lemah">{sorted.length}</span>
            </h3>
            <ul className="flex flex-col">
              {sorted.map((candidate) => (
                <CandidateRow
                  key={candidate.facilityId}
                  candidate={candidate}
                  chosen={candidate.facilityId === view.chosenFacilityId}
                />
              ))}
            </ul>
          </section>

          {view.parameters === null ? null : (
            <section className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-ink">Parameter saat diputuskan</h3>
              {buildParameterRows(view.parameters).map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-4 border-b border-garis py-1.5 last:border-b-0"
                >
                  <span className="text-xs text-ink-lemah">{row.label}</span>
                  <span className="font-mono text-xs tabular-nums text-ink">{row.value}</span>
                </div>
              ))}
              {view.assumedSpeed ? (
                <p className="pt-1 text-2xs text-kunyit">Kecepatan kota memakai asumsi bawaan.</p>
              ) : null}
            </section>
          )}
        </div>
      )}
    </Sheet>
  );
}