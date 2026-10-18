import { useState } from "react";
import { Link } from "react-router";
import { isApiError } from "@/api/api-error";
import { describeAnomalySummary, parseAnomalyDetail } from "@/features/anomalies/anomaly-detail";
import { useCloseAnomaly } from "@/features/anomalies/hooks/use-close-anomaly";
import { Button } from "@/shared/components/ui/button";
import { Field } from "@/shared/components/ui/field";
import { Sheet } from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";
import { useToastStore } from "@/shared/components/ui/toast-store";
import {
  ANOMALY_KIND_LABELS,
  ANOMALY_SEVERITY_LABELS,
  ANOMALY_SEVERITY_TONES
} from "@/shared/constants/anomaly.constant";
import type { StatusTone } from "@/shared/constants/tone.constant";
import { cn } from "@/shared/lib/cn";
import { formatDateTime, formatMoment } from "@/shared/lib/format";
import type { AnomalyDto } from "@/shared/types/anomaly.types";

const NOTE_MIN = 10;
const NOTE_MAX = 400;

const TONE_TEXT_CLASSES: Readonly<Record<StatusTone, string>> = Object.freeze({
  daun: "text-daun",
  kunyit: "text-kunyit",
  "biru-tinta": "text-biru-tinta",
  bata: "text-bata",
  netral: "text-ink-lemah"
});

export interface AnomalyDetailSheetProps {
  readonly anomaly: AnomalyDto | null;
  readonly onOpenChange: (open: boolean) => void;
}

export function AnomalyDetailSheet({ anomaly, onOpenChange }: AnomalyDetailSheetProps) {
  const closeAnomaly = useCloseAnomaly();
  const showToast = useToastStore((state) => state.show);
  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [wasId, setWasId] = useState<string | null>(null);

  if (anomaly === null) return null;

  if (anomaly.id !== wasId) {
    setWasId(anomaly.id);
    setCatatan("");
    setError(null);
  }

  const view = parseAnomalyDetail(anomaly.jenis, anomaly.detail);
  const summary = describeAnomalySummary(anomaly.jenis, view);

  const submit = () => {
    setError(null);
    const trimmed = catatan.trim();
    if (trimmed.length < NOTE_MIN) {
      setError(`Catatan penutupan minimal ${NOTE_MIN} karakter.`);
      return;
    }
    closeAnomaly.mutate(
      { anomalyId: anomaly.id, catatan: trimmed },
      {
        onSuccess: () => {
          showToast({ message: "Anomali ditutup" });
          onOpenChange(false);
        },
        onError: (cause) => {
          setError(isApiError(cause) ? cause.message : "Tidak dapat menutup anomali ini.");
        }
      }
    );
  };

  return (
    <Sheet
      open
      onOpenChange={onOpenChange}
      title={ANOMALY_KIND_LABELS[anomaly.jenis]}
      description={`${anomaly.sppgNama} · dibuka ${formatMoment(anomaly.dibukaAt)}`}
      footer={
        anomaly.terbuka ? (
          <Button size="lg" fullWidth loading={closeAnomaly.isPending} onClick={submit}>
            Tutup anomali
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3 border-b border-garis pb-4">
          <span
            className={cn(
              "text-sm font-medium",
              TONE_TEXT_CLASSES[ANOMALY_SEVERITY_TONES[anomaly.tingkat]]
            )}
          >
            {ANOMALY_SEVERITY_LABELS[anomaly.tingkat]}
          </span>
          {anomaly.batchId === null ? null : (
            <Link
              to={`/batches/${anomaly.batchId}`}
              className="text-sm text-biru-tinta underline underline-offset-2"
            >
              Buka batch
            </Link>
          )}
        </div>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-ink">Rincian</h2>
          <p className="text-sm text-ink-lemah">{summary}</p>
          {view.items.length === 0 ? null : (
            <ul className="flex flex-col">
              {view.items.map((item, index) => (
                <li
                  key={index}
                  className="flex flex-col border-b border-garis py-2 last:border-b-0"
                >
                  <div className="flex flex-col gap-1">
                    {item.lines.map((line) => (
                      <div
                        key={`${line.label}-${line.value}`}
                        className="flex items-baseline justify-between gap-4"
                      >
                        <span className="text-xs text-ink-lemah">{line.label}</span>
                        <span className="font-mono text-xs tabular-nums text-ink">{line.value}</span>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {view.penutupan === null ? (
          <Field
            label="Catatan penutupan"
            required
            hint={`Wajib, minimal ${NOTE_MIN} karakter — tersimpan untuk audit.`}
          >
            {(control) => (
              <Textarea
                id={control.id}
                aria-describedby={control.describedBy}
                rows={4}
                maxLength={NOTE_MAX}
                value={catatan}
                onChange={(event) => setCatatan(event.target.value)}
              />
            )}
          </Field>
        ) : (
          <section className="flex flex-col gap-1 border-t border-garis pt-4">
            <h2 className="text-sm font-medium text-ink">Penutupan</h2>
            <p className="text-sm text-ink">{view.penutupan.catatan}</p>
            <p className="font-mono text-2xs text-ink-lemah">
              {view.penutupan.otomatis ? "ditutup otomatis" : "ditutup manual"}
              {view.penutupan.at === null ? "" : ` · ${formatDateTime(view.penutupan.at)}`}
            </p>
          </section>
        )}

        {error === null ? null : (
          <p role="alert" className="text-sm text-bata">
            {error}
          </p>
        )}
      </div>
    </Sheet>
  );
}
