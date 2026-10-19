import { useDashboardImpact } from "@/features/dashboard/hooks/use-dashboard-impact";
import { cn } from "@/shared/lib/cn";
import { formatNumber, formatRupiah } from "@/shared/lib/format";
import type { DashboardImpact } from "@/shared/types/dashboard.types";

interface ColumnProps {
  readonly title: string;
  readonly subtitle: string;
  readonly km: number;
  readonly cost: number | null;
  readonly highlighted: boolean;
  readonly badge?: string;
}

function Column({ title, subtitle, km, cost, highlighted, badge }: ColumnProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-kontrol border px-3 py-2.5",
        highlighted ? "border-biru-tinta/50 bg-biru-tinta/5" : "border-garis"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-ink">{title}</span>
        {badge === undefined ? null : (
          <span className="rounded-full border border-bata/50 px-2 font-mono text-2xs text-bata">
            {badge}
          </span>
        )}
      </div>
      <p className="text-2xs text-ink-lemah">{subtitle}</p>
      <dl className="flex flex-col">
        <div className="flex items-baseline justify-between gap-3 border-t border-garis pt-2">
          <dt className="text-xs text-ink-lemah">Jarak</dt>
          <dd className="font-mono text-md tabular-nums text-ink">
            {formatNumber(km, 1)} km
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-garis pt-2">
          <dt className="text-xs text-ink-lemah">Estimasi biaya</dt>
          <dd className="font-mono text-sm tabular-nums text-ink">
            {cost === null ? "belum dikalibrasi" : formatRupiah(cost)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function StatRow({ label, value, tone }: { readonly label: string; readonly value: number; readonly tone?: "daun" | "kunyit" | "bata" }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-garis py-1.5 last:border-b-0">
      <span className="text-xs text-ink-lemah">{label}</span>
      <span
        className={cn(
          "font-mono text-sm tabular-nums",
          tone === "daun"
            ? "text-daun"
            : tone === "kunyit"
              ? "text-kunyit"
              : tone === "bata"
                ? "text-bata"
                : "text-ink"
        )}
      >
        {formatNumber(value, 0)}
      </span>
    </div>
  );
}

function ImpactBody({ data }: { readonly data: DashboardImpact }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 lg:grid-cols-2">
        <Column
          title="Fasilitas terdekat"
          subtitle="Pembanding: jarak lurus tanpa memeriksa profil penerimaan."
          km={data.nearest.totalKm}
          cost={data.nearest.estimasiBiayaRp}
          highlighted={false}
          {...(data.nearest.tidakSesuaiProfil > 0
            ? { badge: `${formatNumber(data.nearest.tidakSesuaiProfil, 0)} tak sesuai profil` }
            : {})}
        />
        <Column
          title="Keputusan ARGUS"
          subtitle="Fasilitas yang lolos profil; batch yang bisa ditangani di sumber tidak diangkut."
          km={data.argus.totalKm}
          cost={data.argus.estimasiBiayaRp}
          highlighted
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="flex flex-col">
          <p className="label-cap pb-1 text-ink-lemah">Hasil batch</p>
          <StatRow label="Diterima / selesai diolah" value={data.batch.diterima} tone="daun" />
          <StatRow
            label="Butuh tindak lanjut"
            value={data.batch.butuhTindakLanjut}
            tone={data.batch.butuhTindakLanjut > 0 ? "bata" : undefined}
          />
        </section>
        <section className="flex flex-col">
          <p className="label-cap pb-1 text-ink-lemah">Jalur penanganan</p>
          <StatRow label="Ditangani di sumber tanpa angkut" value={data.batch.ditanganiDiSumber} tone="daun" />
          <StatRow label="Dialihkan ke fasilitas" value={data.batch.dialihkan} />
          <StatRow
            label="Menunggu putusan"
            value={data.batch.menungguPutusan}
            tone={data.batch.menungguPutusan > 0 ? "kunyit" : undefined}
          />
        </section>
      </div>

      <p className="font-mono text-2xs text-ink-lemah">
        {formatNumber(data.dibandingkan, 0)} dari {formatNumber(data.batch.total, 0)} batch
        dibandingkan
        {data.biayaPerKm === null ? " · biaya per km belum dikalibrasi" : ` · ${formatRupiah(data.biayaPerKm)}/km`}
      </p>

      <p className="text-xs text-ink-lemah">{data.catatan}</p>
    </div>
  );
}

export function ImpactPanel({ sppgId }: { readonly sppgId: string | null }) {
  const query = useDashboardImpact(sppgId);
  const data = query.data;

  if (query.isPending) {
    return (
      <section className="rounded-kontainer border border-garis px-4 py-3">
        <h2 className="text-sm font-medium text-ink">Perbandingan keputusan</h2>
        <p className="mt-2 text-sm text-ink-lemah">Menghitung pembanding…</p>
      </section>
    );
  }

  if (data === undefined) return null;

  return (
    <section className="flex flex-col gap-3 rounded-kontainer border border-garis px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-ink">Perbandingan keputusan</h2>
        <span className="font-mono text-2xs text-ink-lemah">{data.date}</span>
      </div>
      <ImpactBody data={data} />
    </section>
  );
}
