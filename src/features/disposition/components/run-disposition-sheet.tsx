import { useEffect, useState } from "react";
import { isApiError } from "@/api/api-error";
import { useRunDisposition } from "@/features/disposition/hooks/use-run-disposition";
import { useSppgList } from "@/features/sppg/hooks/use-sppg-list";
import { Button } from "@/shared/components/ui/button";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Sheet } from "@/shared/components/ui/sheet";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { formatInt, wibIsoDate } from "@/shared/lib/format";
import type { RunDispositionReport } from "@/shared/types/disposition.types";

export interface RunDispositionSheetProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly defaultDate: string;
}

export function RunDispositionSheet({ open, onOpenChange, defaultDate }: RunDispositionSheetProps) {
  const sppgQuery = useSppgList(true);
  const run = useRunDisposition();
  const showToast = useToastStore((state) => state.show);
  const [sppgId, setSppgId] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [report, setReport] = useState<RunDispositionReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSppgId("");
    setDate(defaultDate === "" ? wibIsoDate(0) : defaultDate);
    setReport(null);
    setError(null);
  }, [open, defaultDate]);

  const submit = () => {
    setError(null);
    if (sppgId === "") {
      setError("Pilih dapur terlebih dahulu.");
      return;
    }
    run.mutate(
      { sppgId, date },
      {
        onSuccess: (result) => {
          setReport(result);
          showToast({ message: `Disposisi dijalankan untuk ${formatInt(result.processed)} batch` });
        },
        onError: (cause) => {
          setError(
            isApiError(cause) ? cause.message : "Tidak dapat menjalankan disposisi saat ini."
          );
        }
      }
    );
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Jalankan disposisi"
      description="Menilai ulang antrean tanggal itu dan menetapkan tingkat untuk batch yang belum diputus."
      footer={
        report === null ? (
          <Button size="lg" fullWidth loading={run.isPending} onClick={submit}>
            Jalankan disposisi
          </Button>
        ) : (
          <Button size="lg" fullWidth variant="secondary" onClick={() => onOpenChange(false)}>
            Selesai
          </Button>
        )
      }
    >
      {report === null ? (
        <div className="flex flex-col gap-4">
          <Field label="Dapur (SPPG)" required hint="Disposisi berjalan per dapur per tanggal.">
            {(control) => (
              <Select
                id={control.id}
                aria-describedby={control.describedBy}
                value={sppgId}
                onChange={(event) => setSppgId(event.target.value)}
              >
                <option value="">Pilih dapur</option>
                {(sppgQuery.data?.items ?? []).map((sppg) => (
                  <option key={sppg.id} value={sppg.id}>
                    {sppg.nama}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Tanggal (WIB)">
            {(control) => (
              <Input
                id={control.id}
                aria-describedby={control.describedBy}
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            )}
          </Field>
          {error === null ? null : (
            <p role="alert" className="text-sm text-bata">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink">
            {formatInt(report.processed)} batch diproses · {formatInt(report.decisions.length)}{" "}
            keputusan
          </p>
          {report.processed === 0 ? (
            <p className="text-sm text-ink-lemah">
              Tidak ada batch yang menunggu putusan pada tanggal itu.
            </p>
          ) : null}
          {report.missingParameters.length === 0 ? (
            <p className="text-sm text-ink-lemah">Semua parameter skor tersedia.</p>
          ) : (
            <div className="rounded-kontainer border border-kunyit/40 bg-kunyit/5 px-3 py-2">
              <p className="text-xs text-kunyit">
                Parameter belum dikalibrasi — batch terkait memakai jalur aman T4:
              </p>
              <p className="mt-1 flex flex-wrap gap-1.5">
                {report.missingParameters.map((key) => (
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
        </div>
      )}
    </Sheet>
  );
}