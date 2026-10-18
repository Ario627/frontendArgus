import { Link } from "react-router";
import { describeAnomalySummary, parseAnomalyDetail } from "@/features/anomalies/anomaly-detail";
import { ANOMALY_KIND_LABELS, ANOMALY_SEVERITY_LABELS, ANOMALY_SEVERITY_TONES } from "@/shared/constants/anomaly.constant";
import type { StatusTone } from "@/shared/constants/tone.constant";
import { cn } from "@/shared/lib/cn";
import { formatMoment } from "@/shared/lib/format";
import type { AnomalyDto } from "@/shared/types/anomaly.types";

const TONE_TEXT_CLASSES: Readonly<Record<StatusTone, string>> = Object.freeze({
  daun: "text-daun",
  kunyit: "text-kunyit",
  "biru-tinta": "text-biru-tinta",
  bata: "text-bata",
  netral: "text-ink-lemah"
});

export interface AnomalyTableProps {
  readonly anomalies: readonly AnomalyDto[];
  readonly onOpen: (anomaly: AnomalyDto) => void;
  readonly className?: string;
}

export function AnomalyTable({ anomalies, onOpen, className }: AnomalyTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-garis">
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Waktu</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Jenis</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Dapur</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Rincian</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Tingkat</th>
            <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Status</th>
          </tr>
        </thead>
        <tbody>
          {anomalies.map((anomaly) => {
            const view = parseAnomalyDetail(anomaly.jenis, anomaly.detail);
            const summary = describeAnomalySummary(anomaly.jenis, view);
            return (
              <tr
                key={anomaly.id}
                className="relative h-12 border-b border-garis transition-colors duration-150 ease-out hover:bg-ink/5"
              >
                <td className="px-2">
                  <button
                    type="button"
                    onClick={() => onOpen(anomaly)}
                    className="font-mono text-xs text-ink after:absolute after:inset-0 hover:underline"
                  >
                    {formatMoment(anomaly.dibukaAt)}
                  </button>
                </td>
                <td className="px-2 text-xs text-ink">{ANOMALY_KIND_LABELS[anomaly.jenis]}</td>
                <td className="px-2 max-w-40">
                  <span className="block truncate text-xs text-ink-lemah">{anomaly.sppgNama}</span>
                </td>
                <td className="px-2 max-w-64">
                  <span className="block truncate text-xs text-ink-lemah">{summary}</span>
                </td>
                <td
                  className={cn(
                    "px-2 text-xs font-medium",
                    TONE_TEXT_CLASSES[ANOMALY_SEVERITY_TONES[anomaly.tingkat]]
                  )}
                >
                  {ANOMALY_SEVERITY_LABELS[anomaly.tingkat]}
                </td>
                <td className="px-2 text-xs">
                  {anomaly.terbuka ? (
                    <span className="text-kunyit">Terbuka</span>
                  ) : (
                    <span className="text-daun">
                      Ditutup
                      {anomaly.batchId === null ? null : (
                        <Link
                          to={`/batches/${anomaly.batchId}`}
                          className="relative z-10 ml-2 text-biru-tinta hover:underline"
                        >
                          batch
                        </Link>
                      )}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
