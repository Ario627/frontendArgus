import { useState } from "react";
import { isApiError } from "@/api/api-error";
import {
  useExportBatches,
  type ExportResultView
} from "@/features/export/hooks/use-export-batches";
import {
  EXPORT_DEFAULT_RANGE_DAYS,
  EXPORT_MAX_RANGE_DAYS,
  rangeDaysInclusive,
  type ExportFormat
} from "@/features/export/export-download";
import { Button } from "@/shared/components/ui/button";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/cn";
import { formatBytes, formatDateOnly, formatInt, wibIsoDate } from "@/shared/lib/format";

export interface SppgOption {
  readonly id: string;
  readonly nama: string;
}

export interface ExportPanelProps {
  readonly sppgId: string | null;
  readonly sppgOptions: readonly SppgOption[];
  readonly onSppgChange: (sppgId: string | null) => void;
}

function ResultLine({ result }: { readonly result: ExportResultView }) {
  const parts: string[] = [`≈ ${formatBytes(result.sizeBytes)}`];
  if (result.meta.rows !== null) parts.push(`${formatInt(result.meta.rows)} baris`);
  if (result.meta.pages !== null) parts.push(`${formatInt(result.meta.pages)} halaman`);

  return (
    <div className="flex flex-col gap-1 rounded-kontainer border border-garis px-4 py-3">
      <p className="truncate font-mono text-sm text-ink">{result.filename}</p>
      <p className="font-mono text-xs tabular-nums text-ink-lemah">{parts.join(" · ")}</p>
      {result.meta.truncated === true ? (
        <p className="text-xs text-kunyit">
          Data dipotong ke batas baris — persempit periode untuk ekspor lengkap.
        </p>
      ) : null}
      {result.meta.quotaRemaining === null ? null : (
        <p className="text-xs text-ink-lemah">
          Sisa kuota ekspor hari ini: <span className="font-mono">{formatInt(result.meta.quotaRemaining)}</span>
        </p>
      )}
    </div>
  );
}

export function ExportPanel({ sppgId, sppgOptions, onSppgChange }: ExportPanelProps) {
  const [from, setFrom] = useState(wibIsoDate(EXPORT_DEFAULT_RANGE_DAYS - 1));
  const [to, setTo] = useState(wibIsoDate(0));
  const [result, setResult] = useState<ExportResultView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const exportBatches = useExportBatches();

  const pendingFormat = exportBatches.isPending ? exportBatches.variables?.format : undefined;

  const submit = (format: ExportFormat) => {
    setError(null);
    if (from === "" || to === "") {
      setError("Isi periode ekspor terlebih dahulu.");
      return;
    }
    if (from > to) {
      setError("Tanggal mulai harus sebelum tanggal akhir.");
      return;
    }
    const span = rangeDaysInclusive(from, to);
    if (span > EXPORT_MAX_RANGE_DAYS) {
      setError(`Periode maksimal ${EXPORT_MAX_RANGE_DAYS} hari (periode ini ${span} hari).`);
      return;
    }
    exportBatches.mutate(
      {
        format,
        query: { from, to, ...(sppgId === null ? {} : { sppgId }) }
      },
      {
        onSuccess: (data) => {
          setResult(data);
        },
        onError: (cause) => {
          setError(
            isApiError(cause) ? cause.message : "Ekspor tidak dapat dijalankan. Coba lagi."
          );
        }
      }
    );
  };

  const span = from !== "" && to !== "" && from <= to ? rangeDaysInclusive(from, to) : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Dari" className="w-44">
          {(control) => (
            <Input
              id={control.id}
              aria-describedby={control.describedBy}
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          )}
        </Field>
        <Field label="Sampai" className="w-44">
          {(control) => (
            <Input
              id={control.id}
              aria-describedby={control.describedBy}
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          )}
        </Field>
        <Field label="Dapur" className="w-52">
          {(control) => (
            <Select
              id={control.id}
              aria-describedby={control.describedBy}
              value={sppgId ?? ""}
              onChange={(event) =>
                onSppgChange(event.target.value === "" ? null : event.target.value)
              }
            >
              <option value="">Semua dapur</option>
              {sppgOptions.map((sppg) => (
                <option key={sppg.id} value={sppg.id}>
                  {sppg.nama}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <p className="font-mono text-xs tabular-nums text-ink-lemah">
        {span === 0
          ? `Periode maksimal ${EXPORT_MAX_RANGE_DAYS} hari`
          : `${formatDateOnly(from)} — ${formatDateOnly(to)} · ${formatInt(span)} hari`}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          loading={pendingFormat === "csv"}
          disabled={exportBatches.isPending}
          onClick={() => submit("csv")}
        >
          Unduh CSV (filter ini)
        </Button>
        <Button
          variant="secondary"
          loading={pendingFormat === "pdf"}
          disabled={exportBatches.isPending}
          onClick={() => submit("pdf")}
        >
          Unduh PDF
        </Button>
      </div>

      {error === null ? null : (
        <p
          role="alert"
          className={cn("rounded-kontainer border border-bata/40 bg-bata/5 px-3 py-2 text-sm text-bata")}
        >
          {error}
        </p>
      )}

      {result === null ? null : <ResultLine result={result} />}

      <p className="text-xs text-ink-lemah">
        Ekspor memakai filter yang sedang aktif dan tercatat di jejak audit.
      </p>
    </div>
  );
}