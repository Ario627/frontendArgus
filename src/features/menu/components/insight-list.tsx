import { INSIGHT_CONFIDENCE_LABELS, MENU_COMPONENT_LABELS, INSIGHT_SAMPLE_MIN } from "@/shared/constants/menu.constant";
import { cn } from "@/shared/lib/cn";
import { formatInt, formatNumber, formatRupiah } from "@/shared/lib/format";
import type { MenuInsightItem, MenuInsightReport } from "@/shared/types/menu.types";

export interface InsightListProps {
  readonly report: MenuInsightReport;
  readonly className?: string;
}

function InsightRow({ item, rank }: { readonly item: MenuInsightItem; readonly rank: number }) {
  const estimasi = item.estimasiNilaiTerbuangRpPerHari;
  return (
    <li className="flex gap-3 border-b border-garis py-3 last:border-b-0">
      <span className="w-6 shrink-0 pt-0.5 font-mono text-2xs tabular-nums text-ink-lemah">
        {String(rank).padStart(2, "0")}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-sm text-ink">{item.nama}</span>
          {estimasi === null ? (
            <span className="shrink-0 text-xs text-ink-lemah">Belum tersedia</span>
          ) : (
            <span className="shrink-0 font-mono text-sm tabular-nums text-ink">
              {formatRupiah(estimasi)}
              <span className="text-ink-lemah">/hari</span>
            </span>
          )}
        </div>
        <p className="flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-2xs text-ink-lemah">
          <span>{MENU_COMPONENT_LABELS[item.komponen].toLowerCase()}</span>
          <span>sisa {formatNumber(item.avgTingkatSisa, 1)}/4</span>
          <span>n {formatInt(item.n)}</span>
          <span>{item.hari} hari</span>
          <span className={cn(item.confidence === "rendah" && "text-kunyit")}>
            {INSIGHT_CONFIDENCE_LABELS[item.confidence]}
          </span>
        </p>
        {item.catatan === null ? null : <p className="text-2xs text-kunyit">{item.catatan}</p>}
      </div>
    </li>
  );
}

export function InsightList({ report, className }: InsightListProps) {
  const totalN = report.items.reduce((sum, item) => sum + item.n, 0);

  if (report.items.length === 0) {
    return (
      <div className={cn("flex flex-col gap-1 py-8", className)}>
        <p className="text-md font-medium text-ink">Belum cukup data.</p>
        <p className="text-sm text-ink-lemah">
          Butuh minimal {INSIGHT_SAMPLE_MIN} penilaian untuk menampilkan pola.
        </p>
        <p className="font-mono text-xs text-ink-lemah">
          {formatInt(totalN)}/{INSIGHT_SAMPLE_MIN} terkumpul
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <ul className="flex flex-col">
        {report.items.map((item, index) => (
          <InsightRow key={item.menuItemId} item={item} rank={index + 1} />
        ))}
      </ul>
      <p className="text-2xs text-ink-lemah">
        Estimasi metode linear 0–4 dari {formatInt(totalN)} penilaian · {report.from} sampai {report.to}
      </p>
    </div>
  );
}