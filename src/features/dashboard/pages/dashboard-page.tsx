import type { ReactNode } from "react";
import { isApiError } from "@/api/api-error";
import { useDashboardSummary } from "@/features/dashboard/hooks/use-dashboard-summary";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { useDelayedLoading } from "@/shared/hooks/use-delayed-loading";
import { cn } from "@/shared/lib/cn";
import { formatDateOnly, formatInt, formatKg } from "@/shared/lib/format";

interface FigureProps {
  readonly label: string;
  readonly value: string;
}

function Figure({ label, value }: FigureProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-ink-lemah">{label}</span>
      <span className="font-mono text-2xl [font-variant-numeric:tabular-nums] text-ink">{value}</span>
    </div>
  );
}

interface CountRowProps {
  readonly label: string;
  readonly count: number;
  readonly tone?: "kunyit" | "bata";
}

function CountRow({ label, count, tone }: CountRowProps) {
  const toneClass =
    tone === undefined || count === 0 ? "text-ink" : tone === "bata" ? "text-bata" : "text-kunyit";

  return (
    <div className="flex items-center justify-between gap-4 border-b border-garis py-2 last:border-b-0">
      <span className="text-sm text-ink-lemah">{label}</span>
      <span className={cn("font-mono text-sm [font-variant-numeric:tabular-nums]", toneClass)}>
        {formatInt(count)}
      </span>
    </div>
  );
}

interface PanelProps {
  readonly title: string;
  readonly children: ReactNode;
}

function Panel({ title, children }: PanelProps) {
  return (
    <section className="rounded-kontainer border border-garis">
      <h2 className="border-b border-garis px-4 py-2.5 text-sm font-medium text-ink">{title}</h2>
      <div className="px-4 py-1">{children}</div>
    </section>
  );
}

export function DashboardPage() {
  const summary = useDashboardSummary();
  const data = summary.data;
  const apiError = isApiError(summary.error) ? summary.error : null;
  const showSkeleton = useDelayedLoading(summary.isLoading);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Ringkasan"
        description={
          data === undefined
            ? undefined
            : `${formatDateOnly(data.date)} · ${data.scopeSppgId === null ? "Semua dapur" : "Dapur Anda"}`
        }
      />
      {showSkeleton ? <SkeletonList rows={8} /> : null}
      {summary.isError ? (
        <ErrorState
          description={apiError?.message ?? "Periksa jaringan lalu coba lagi."}
          requestId={apiError?.requestId}
          onRetry={() => {
            void summary.refetch();
          }}
        />
      ) : null}
      {data === undefined ? null : (
        <>
          <div className="flex flex-wrap gap-x-12 gap-y-4 border-b border-garis pb-5">
            <Figure label="Batch hari ini" value={formatInt(data.batch.total)} />
            <Figure label="Berat tercatat" value={formatKg(data.batch.totalKg)} />
          </div>
          {data.batch.total === 0 ? (
            <p className="-mt-2 text-sm text-ink-lemah">Belum ada batch tercatat hari ini.</p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <Panel title="Gerbang penerimaan">
              <CountRow label="LOLOS" count={data.batch.gate.lolos} />
              <CountRow label="PERBAIKI" count={data.batch.gate.perbaiki} tone="kunyit" />
              <CountRow label="ALIHKAN" count={data.batch.gate.alihkan} />
              <CountRow label="TOLAK" count={data.batch.gate.tolak} tone="bata" />
            </Panel>
            <Panel title="Perlu tindak lanjut">
              <CountRow label="Menunggu angkut" count={data.batch.status.menungguAngkut} />
              <CountRow label="Menunggu putusan" count={data.batch.menungguPutusan} />
              <CountRow label="Perlu perbaikan" count={data.batch.status.gagalGate} tone="kunyit" />
              <CountRow label="Tersangkut" count={data.batch.status.tersangkut} tone="bata" />
              <CountRow label="Anomali terbuka" count={data.operasional.anomaliTerbuka} tone="bata" />
              <CountRow label="Tiket baru" count={data.operasional.tiketBaru} tone="kunyit" />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}