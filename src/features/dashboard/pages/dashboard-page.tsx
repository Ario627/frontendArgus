import type { ReactNode } from "react";
import { Link } from "react-router";
import { isApiError } from "@/api/api-error";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { NarrativePanel } from "@/features/dashboard/components/narrative-panel";
import { useDashboardSummary } from "@/features/dashboard/hooks/use-dashboard-summary";
import { RulerTicks } from "@/shared/components/data/ruler-ticks";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import type { StatusTone } from "@/shared/constants/tone.constant";
import { useDelayedLoading } from "@/shared/hooks/use-delayed-loading";
import { cn } from "@/shared/lib/cn";
import { formatDateOnly, formatInt, formatNumber } from "@/shared/lib/format";
import type { DashboardGateCounts } from "@/shared/types/dashboard.types";

const TONE_DOT_CLASSES: Readonly<Record<StatusTone, string>> = Object.freeze({
  daun: "bg-daun",
  kunyit: "bg-kunyit",
  "biru-tinta": "bg-biru-tinta",
  bata: "bg-bata",
  netral: "bg-ink-lemah"
});

const TONE_TEXT_CLASSES: Readonly<Record<StatusTone, string>> = Object.freeze({
  daun: "text-daun",
  kunyit: "text-kunyit",
  "biru-tinta": "text-biru-tinta",
  bata: "text-bata",
  netral: "text-ink-lemah"
});

interface ReadoutProps {
  readonly label: string;
  readonly value: string;
  readonly unit?: string;
  readonly tone?: StatusTone;
}

function Readout({ label, value, unit, tone }: ReadoutProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-ink-lemah">{label}</span>
      <span
        className={cn(
          "flex items-baseline gap-1 font-mono text-2xl tabular-nums",
          tone === undefined ? "text-ink" : TONE_TEXT_CLASSES[tone]
        )}
      >
        {value}
        {unit === undefined ? null : <span className="text-sm text-ink-lemah">{unit}</span>}
      </span>
    </div>
  );
}

interface GateSegment {
  readonly label: string;
  readonly count: number;
  readonly tone: StatusTone;
}

function GateDistribution({ gate }: { readonly gate: DashboardGateCounts }) {
  const segments: readonly GateSegment[] = [
    { label: "Lolos", count: gate.lolos, tone: "daun" },
    { label: "Perbaiki", count: gate.perbaiki, tone: "kunyit" },
    { label: "Alihkan", count: gate.alihkan, tone: "biru-tinta" },
    { label: "Tolak", count: gate.tolak, tone: "bata" }
  ];
  const counted = segments.reduce((sum, segment) => sum + segment.count, 0);

  if (counted === 0) {
    return (
      <p className="px-4 py-4 text-sm text-ink-lemah">
        Belum ada keputusan gerbang hari ini.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-3.5">
      <div role="img" aria-label={`Distribusi gerbang dari ${counted} batch`} className="flex h-2.5 w-full overflow-hidden rounded-full">
        {segments.map((segment) =>
          segment.count === 0 ? null : (
            <span
              key={segment.label}
              className={cn(TONE_DOT_CLASSES[segment.tone], "h-full")}
              style={{ width: `${(segment.count / counted) * 100}%` }}
            />
          )
        )}
      </div>
      <ul className="flex flex-col">
        {segments.map((segment) => (
          <li
            key={segment.label}
            className="flex items-center justify-between gap-4 border-b border-garis py-2 last:border-b-0"
          >
            <span className="flex items-center gap-2 text-sm text-ink-lemah">
              <span aria-hidden className={cn("size-2 rounded-full", TONE_DOT_CLASSES[segment.tone])} />
              {segment.label}
            </span>
            <span className="flex items-baseline gap-2">
              <span
                className={cn(
                  "font-mono text-sm tabular-nums",
                  segment.count === 0 ? "text-ink-lemah" : "text-ink"
                )}
              >
                {formatInt(segment.count)}
              </span>
              <span className="w-9 text-right font-mono text-2xs tabular-nums text-ink-lemah">
                {Math.round((segment.count / counted) * 100)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ActionItem {
  readonly label: string;
  readonly count: number;
  readonly to?: string;
  readonly tone?: StatusTone;
}

function ActionRow({ item }: { readonly item: ActionItem }) {
  const countTone =
    item.count === 0 ? "text-ink-lemah" : TONE_TEXT_CLASSES[item.tone ?? "netral"];

  const content = (
    <>
      <span className="text-sm text-ink">{item.label}</span>
      <span className={cn("font-mono text-sm tabular-nums", countTone)}>{formatInt(item.count)}</span>
    </>
  );

  if (item.to === undefined) {
    return (
      <div className="flex h-11 items-center justify-between gap-4 border-b border-garis px-4 last:border-b-0">
        {content}
      </div>
    );
  }

  return (
    <Link
      to={item.to}
      className="flex h-11 items-center justify-between gap-4 border-b border-garis px-4 transition-colors duration-150 ease-out last:border-b-0 hover:bg-ink/5"
    >
      {content}
    </Link>
  );
}

function Card({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  return (
    <section className="rounded-kontainer border border-garis">
      <h2 className="border-b border-garis px-4 py-2.5 text-sm font-medium text-ink">{title}</h2>
      {children}
    </section>
  );
}

export function DashboardPage() {
  const role = useAuthStore((state) => state.role);
  const canAudit = role === "admin" || role === "dlh_auditor";
  const summary = useDashboardSummary();
  const data = summary.data;
  const apiError = isApiError(summary.error) ? summary.error : null;
  const showSkeleton = useDelayedLoading(summary.isLoading);

  const actions: readonly ActionItem[] =
    data === undefined
      ? []
      : [
          {
            label: "Menunggu angkut",
            count: data.batch.status.menungguAngkut,
            to: "/batches?status=MENUNGGU_ANGKUT"
          },
          { label: "Menunggu putusan", count: data.batch.menungguPutusan, to: "/dispositions" },
          {
            label: "Perlu perbaikan",
            count: data.batch.status.gagalGate,
            to: "/batches?status=GAGAL_GATE",
            tone: "kunyit"
          },
          {
            label: "Tersangkut",
            count: data.batch.status.tersangkut,
            to: "/batches?status=TERSANGKUT",
            tone: "bata"
          },
          {
            label: "Anomali terbuka",
            count: data.operasional.anomaliTerbuka,
            tone: "bata",
            ...(canAudit ? { to: "/anomalies" } : {})
          },
          { label: "Tiket baru", count: data.operasional.tiketBaru, to: "/tickets", tone: "kunyit" }
        ];

  return (
    <div className="flex max-w-4xl flex-col gap-6">
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
          <section className="rounded-kontainer border border-garis">
            <RulerTicks className="mx-4 mt-3 opacity-60" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 px-4 pt-3 pb-4 md:grid-cols-4 md:px-5 md:pb-5">
              <Readout label="Batch hari ini" value={formatInt(data.batch.total)} unit="batch" />
              <Readout
                label="Berat tercatat"
                value={formatNumber(data.batch.totalKg, 1)}
                unit="kg"
              />
              <Readout label="Selesai diolah" value={formatInt(data.batch.status.selesai)} />
              <Readout
                label="Menunggu putusan"
                value={formatInt(data.batch.menungguPutusan)}
                tone={data.batch.menungguPutusan > 0 ? "kunyit" : undefined}
              />
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <Card title="Gerbang penerimaan">
              <GateDistribution gate={data.batch.gate} />
            </Card>
            <Card title="Perlu tindak lanjut">
              <div className="flex flex-col">
                {actions.map((item) => (
                  <ActionRow key={item.label} item={item} />
                ))}
              </div>
            </Card>
          </div>

          <NarrativePanel sppgId={data.scopeSppgId} canRefresh={role === "admin"} />

          <p className="text-xs text-ink-lemah">
            Angka dihitung dari catatan hari ini (WIB) dan tersaring sesuai akses akun Anda.
          </p>
        </>
      )}
    </div>
  );
}
