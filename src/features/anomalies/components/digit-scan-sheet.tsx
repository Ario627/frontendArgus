import { useState } from "react";
import { isApiError } from "@/api/api-error";
import { useDigitScan } from "@/features/anomalies/hooks/use-digit-scan";
import { useSppgList } from "@/features/sppg/hooks/use-sppg-list";
import { Button } from "@/shared/components/ui/button";
import { Chip, ChipButton } from "@/shared/components/ui/chip";
import { Select } from "@/shared/components/ui/select";
import { Sheet } from "@/shared/components/ui/sheet";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { cn } from "@/shared/lib/cn";
import { formatDateOnly, formatNumber, formatPercent } from "@/shared/lib/format";
import {
  DIGIT_LOOKBACK_MAX_DAYS,
  DIGIT_LOOKBACK_MIN_DAYS,
  DIGIT_REASON_LABELS
} from "@/shared/types/digit.types";
import type { DigitScanResult } from "@/shared/types/digit.types";

const LOOKBACK_PRESETS = Object.freeze([14, 30, 90]);
const DEFAULT_LOOKBACK = 30;

export interface DigitScanSheetProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function DigitScanSheet({ open, onOpenChange }: DigitScanSheetProps) {
  const sppgList = useSppgList(true, { enabled: open });
  const scan = useDigitScan();
  const showToast = useToastStore((state) => state.show);
  const [sppgId, setSppgId] = useState("");
  const [lookback, setLookback] = useState(DEFAULT_LOOKBACK);
  const [result, setResult] = useState<DigitScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sppgName = (id: string): string =>
    sppgList.data?.items.find((sppg) => sppg.id === id)?.nama ?? `SPPG ${id.slice(0, 8)}`;

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const submit = () => {
    setError(null);
    scan.mutate(
      {
        ...(sppgId === "" ? {} : { sppgId }),
        lookbackDays: lookback
      },
      {
        onSuccess: (data) => {
          setResult(data);
          const flagged = data.entries.filter((entry) => entry.flagged).length;
          showToast({
            message:
              flagged === 0
                ? "Pindai selesai. Tidak ada proporsi digit yang mencurigakan."
                : `Pindai selesai. ${flagged} dapur ditandai.`,
            tone: flagged === 0 ? "netral" : "bata"
          });
        },
        onError: (cause) => {
          setError(
            isApiError(cause)
              ? cause.message
              : "Pindai tidak dapat dijalankan. Periksa layanan analitik lalu coba lagi."
          );
        }
      }
    );
  };

  const sortedEntries =
    result === null
      ? []
      : [...result.entries].sort(
          (left, right) =>
            Number(right.flagged) - Number(left.flagged) ||
            right.proportion - left.proportion
        );

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      title="Pindai digit timbangan"
      description="Membandingkan sebaran digit terdepan berat manual dengan ambang parameter. Temuan tersimpan sebagai anomali."
      footer={
        result === null ? (
          <Button fullWidth loading={scan.isPending} onClick={submit}>
            Jalankan pindai
          </Button>
        ) : (
          <Button
            fullWidth
            variant="secondary"
            onClick={() => {
              reset();
            }}
          >
            Pindai lagi
          </Button>
        )
      }
    >
      {result === null ? (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="label-cap text-ink-lemah">Cakupan</span>
            <Select
              aria-label="Cakupan SPPG"
              value={sppgId}
              onChange={(event) => setSppgId(event.target.value)}
            >
              <option value="">Semua dapur</option>
              {(sppgList.data?.items ?? []).map((sppg) => (
                <option key={sppg.id} value={sppg.id}>
                  {sppg.nama}
                </option>
              ))}
            </Select>
          </label>

          <div className="flex flex-col gap-2" role="group" aria-label="Jendela hari ke belakang">
            <p className="text-sm font-medium text-ink">Jendela {lookback} hari ke belakang</p>
            <div className="flex flex-wrap gap-2">
              {LOOKBACK_PRESETS.map((days) => (
                <ChipButton
                  key={days}
                  selected={lookback === days}
                  onClick={() => setLookback(days)}
                >
                  {days} hari
                </ChipButton>
              ))}
              <span className="flex items-center gap-2">
                <input
                  type="number"
                  min={DIGIT_LOOKBACK_MIN_DAYS}
                  max={DIGIT_LOOKBACK_MAX_DAYS}
                  value={lookback}
                  aria-label="Jendela hari kustom"
                  className="h-7 w-20 rounded-kontrol border border-garis bg-kertas px-2 font-mono text-sm text-ink"
                  onChange={(event) => {
                    const parsed = Number.parseInt(event.target.value, 10);
                    if (Number.isNaN(parsed)) return;
                    setLookback(
                      Math.min(DIGIT_LOOKBACK_MAX_DAYS, Math.max(DIGIT_LOOKBACK_MIN_DAYS, parsed))
                    );
                  }}
                />
                <span className="text-xs text-ink-lemah">hari</span>
              </span>
            </div>
          </div>

          <p className="text-xs text-ink-lemah">
            Hanya berat yang diambil manual yang dihitung — bacaan timbangan perangkat tidak
            dipakai, karena digitnya bukan ketikan manusia.
          </p>

          {error === null ? null : (
            <p role="alert" className="rounded-kontainer border border-bata/40 bg-bata/5 px-3 py-2 text-sm text-bata">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <dl className="flex flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-garis py-2">
              <dt className="text-sm text-ink-lemah">Jendela</dt>
              <dd className="font-mono text-xs text-ink">
                {formatDateOnly(result.window.dateFrom)} — {formatDateOnly(result.window.dateTo)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-garis py-2">
              <dt className="text-sm text-ink-lemah">Ambang proporsi</dt>
              <dd className="font-mono text-xs text-ink">
                {result.threshold === null
                  ? "belum dikalibrasi"
                  : formatPercent(result.threshold * 100, 0)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-garis py-2">
              <dt className="text-sm text-ink-lemah">Sampel</dt>
              <dd className="font-mono text-xs text-ink">
                {formatNumber(result.sampleSize, 0)} berat · minimum {formatNumber(result.sampleMin, 0)} per dapur
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-2">
              <dt className="text-sm text-ink-lemah">Status</dt>
              <dd
                className={cn(
                  "font-mono text-xs",
                  result.status === "OK" ? "text-daun" : "text-kunyit"
                )}
              >
                {result.status === "OK" ? "seluruh dapur dipindai" : "sebagian dapur dilewati"}
              </dd>
            </div>
          </dl>

          {sortedEntries.length === 0 ? (
            <p className="text-sm text-ink-lemah">
              Tidak ada dapur dengan sampel cukup pada jendela ini.
            </p>
          ) : (
            <ul className="flex flex-col">
              {sortedEntries.map((entry) => (
                <li
                  key={entry.sppgId}
                  className="flex flex-col gap-1 border-b border-garis py-2.5 last:border-b-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-ink">{sppgName(entry.sppgId)}</span>
                    <span className="flex items-center gap-2">
                      {entry.persisted ? <Chip className="h-6 border-bata/50 text-2xs text-bata">tersimpan</Chip> : null}
                      {entry.closed > 0 ? (
                        <Chip className="h-6 border-daun/50 text-2xs text-daun">
                          {entry.closed} ditutup otomatis
                        </Chip>
                      ) : null}
                      <span
                        className={cn(
                          "font-mono text-xs",
                          entry.flagged ? "text-bata" : "text-ink-lemah"
                        )}
                      >
                        {DIGIT_REASON_LABELS[entry.reason]}
                      </span>
                    </span>
                  </div>
                  <span className="font-mono text-2xs text-ink-lemah">
                    proporsi {formatPercent(entry.proportion * 100, 1)}
                    {entry.threshold === null ? "" : ` dari ambang ${formatPercent(entry.threshold * 100, 0)}`}
                    {" · "}
                    {formatNumber(entry.digitCount, 0)}/{formatNumber(entry.sampleCount, 0)} sampel
                  </span>
                </li>
              ))}
            </ul>
          )}

          {result.insufficient.length === 0 ? null : (
            <section className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-ink">Sampel belum cukup</h3>
              <ul className="flex flex-col gap-1 text-xs text-ink-lemah">
                {result.insufficient.map((row) => (
                  <li key={row.sppgId} className="font-mono">
                    {sppgName(row.sppgId)} · {formatNumber(row.manualCount, 0)} berat manual
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.failures.length === 0 ? null : (
            <section className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-ink">Gagal dianalisis</h3>
              <ul className="flex flex-col gap-1 text-xs text-bata">
                {result.failures.map((row) => (
                  <li key={row.sppgId} className="font-mono">
                    {sppgName(row.sppgId)} · {row.reason}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </Sheet>
  );
}
