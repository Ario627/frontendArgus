import { isApiError } from "@/api/api-error";
import {
  describeAnomaly,
  describeChainReason,
  describeParameterSource,
  describeTransfer
} from "@/features/ledger/ledger-format";
import { buildVerifyReportText } from "@/features/ledger/verify-report";
import { useBatchVerification } from "@/features/ledger/hooks/use-batch-verification";
import { Button } from "@/shared/components/ui/button";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useToastStore } from "@/shared/components/ui/toast-store";
import {
  ANOMALY_SEVERITY_LABELS,
  ANOMALY_SEVERITY_TONES
} from "@/shared/constants/anomaly.constant";
import { cn } from "@/shared/lib/cn";
import { formatKgValue, formatNumber, formatPercent } from "@/shared/lib/format";
import type { MassBalanceReport, VerificationReport } from "@/shared/types/ledger.types";

const TONE_TEXT: Readonly<Record<string, string>> = Object.freeze({
  daun: "text-daun",
  kunyit: "text-kunyit",
  bata: "text-bata",
  netral: "text-ink-lemah",
  "biru-tinta": "text-biru-tinta"
});

function BalanceScale({ report }: { readonly report: MassBalanceReport }) {
  const lo = Math.min(report.expectedMinKg, report.receivedKg);
  const hi = Math.max(report.expectedMaxKg, report.receivedKg);
  const span = hi - lo <= 0 ? 1 : hi - lo;
  const bandLeft = ((report.expectedMinKg - lo) / span) * 100;
  const bandWidth = ((report.expectedMaxKg - report.expectedMinKg) / span) * 100;
  const markerLeft = ((report.receivedKg - lo) / span) * 100;
  const ok = report.ok;

  return (
    <div aria-hidden className="relative mx-1 mt-1 mb-2 h-3">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-garis" />
      <div
        className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-daun/30"
        style={{ left: `${bandLeft}%`, width: `${Math.max(bandWidth, 1)}%` }}
      />
      <div
        className={cn(
          "absolute top-0 h-3 w-0.5 -translate-x-1/2 rounded-full",
          ok ? "bg-daun" : "bg-bata"
        )}
        style={{ left: `${markerLeft}%` }}
      />
    </div>
  );
}

interface RowProps {
  readonly label: string;
  readonly value: string;
  readonly tone?: string;
}

function Row({ label, value, tone }: RowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-garis py-2 last:border-b-0">
      <span className="text-sm text-ink-lemah">{label}</span>
      <span className={cn("text-right font-mono text-xs tabular-nums", tone ?? "text-ink")}>
        {value}
      </span>
    </div>
  );
}

function ResultBody({ report }: { readonly report: VerificationReport }) {
  const balance = report.massBalance;
  return (
    <div className="flex flex-col">
      <div className="border-b border-garis px-4 py-3">
        <p className={cn("text-sm font-medium", report.chainOk ? "text-daun" : "text-bata")}>
          {report.chainOk ? "Rantai utuh" : "Rantai timpa"}
          <span className="ml-2 font-mono text-xs font-normal text-ink-lemah">
            {report.eventsChecked} peristiwa
          </span>
        </p>
        {report.chainIssue === null ? null : (
          <p className="mt-0.5 text-xs text-bata">
            Peristiwa ke-{report.chainIssue.index + 1} — {describeChainReason(report.chainIssue.reason)}
          </p>
        )}
      </div>
      <div className="border-b border-garis px-4 py-3">
        <p className="text-sm text-ink">{describeTransfer(report.transfer)}</p>
      </div>
      {balance === null ? null : (
        <div className="border-b border-garis px-4 py-3">
          <p className="text-sm text-ink">Neraca massa</p>
          <BalanceScale report={balance} />
          <Row label="Diserahkan" value={`${formatKgValue(balance.handedOverKg)} kg`} />
          <Row label="Diterima" value={`${formatKgValue(balance.receivedKg)} kg`} />
          <Row
            label="Rentang wajar"
            value={`${formatKgValue(balance.expectedMinKg)}–${formatKgValue(balance.expectedMaxKg)} kg`}
          />
          <Row
            label="Selisih"
            value={formatPercent(balance.deltaPercent, 1)}
            tone={balance.ok ? "text-daun" : "text-bata"}
          />
          <p className="pt-2 text-xs text-ink-lemah">
            Susut wajar {formatNumber(balance.parameter.susutWajar * 100, 1)}% (
            {describeParameterSource(balance.parameter.susutWajarSumber)}) · toleransi{" "}
            {formatNumber(balance.parameter.toleransi * 100, 1)}% (
            {describeParameterSource(balance.parameter.toleransiSumber)})
          </p>
        </div>
      )}
      {report.spoilage.elapsedHours === null ? null : (
        <div className="border-b border-garis px-4 py-3">
          <Row
            label="Umur batch"
            value={
              `${formatNumber(report.spoilage.elapsedHours, 1)}j` +
              (report.spoilage.maxAgeHours === null
                ? " (tanpa batas)"
                : ` dari maks ${formatNumber(report.spoilage.maxAgeHours, 0)}j`)
            }
            tone={report.spoilage.late === true ? "text-bata" : undefined}
          />
        </div>
      )}
      {report.anomalies.length === 0 ? null : (
        <div className="px-4 py-3">
          <p className="text-sm text-ink">Anomali</p>
          <ul className="mt-1 flex flex-col gap-1.5">
            {report.anomalies.map((anomaly) => (
              <li
                key={`${anomaly.jenis}-${anomaly.tingkat}`}
                className="flex items-baseline justify-between gap-3"
              >
                <span className="text-sm text-ink">{describeAnomaly(anomaly)}</span>
                <span
                  className={cn(
                    "shrink-0 text-xs font-medium",
                    TONE_TEXT[ANOMALY_SEVERITY_TONES[anomaly.tingkat]]
                  )}
                >
                  {ANOMALY_SEVERITY_LABELS[anomaly.tingkat]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export interface LedgerVerifyPanelProps {
  readonly batchId: string;
}

export function LedgerVerifyPanel({ batchId }: LedgerVerifyPanelProps) {
  const query = useBatchVerification(batchId);
  const showToast = useToastStore((state) => state.show);
  const apiError = isApiError(query.error) ? query.error : null;

  const copyReport = () => {
    if (query.data === undefined) return;
    void navigator.clipboard
      .writeText(buildVerifyReportText(query.data))
      .then(() => showToast({ message: "Laporan disalin" }))
      .catch(() => showToast({ message: "Tidak bisa menyalin laporan", tone: "bata" }));
  };

  return (
    <section className="rounded-kontainer border border-garis">
      <header className="flex items-center justify-between gap-3 border-b border-garis px-4 py-2.5">
        <h2 className="text-sm font-medium text-ink">Verifikasi ledger</h2>
        <div className="flex items-center gap-2">
          {query.data === undefined ? null : (
            <Button variant="ghost" size="sm" onClick={copyReport}>
              Salin laporan
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            loading={query.isFetching}
            onClick={() => void query.refetch()}
          >
            Periksa ulang
          </Button>
        </div>
      </header>
      {query.isPending ? (
        <div className="flex flex-col gap-2 px-4 py-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-48" />
        </div>
      ) : null}
      {query.isError ? (
        <div className="px-4 py-3">
          <ErrorState
            title="Verifikasi tidak dapat dijalankan"
            description={apiError?.message ?? "Periksa jaringan lalu coba lagi."}
            requestId={apiError?.requestId}
            onRetry={() => void query.refetch()}
          />
        </div>
      ) : null}
      {query.data === undefined || query.isPending ? null : <ResultBody report={query.data} />}
    </section>
  );
}