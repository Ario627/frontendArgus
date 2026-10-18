import { useState } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { ChipButton } from "@/shared/components/ui/chip";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/cn";
import { FRACTION_CODES, FRACTION_LABELS } from "@/shared/constants/fraction.constant";
import { FLOW_LABELS, MOISTURE_LABELS, type MoistureProxy } from "@/shared/constants/flow.constant";
import { buildFractionsFromForm } from "@/shared/lib/fraction-input";
import { formatKg, formatNumber, parseKg } from "@/shared/lib/format";
import type { CaptureFormValues } from "@/features/field-capture/schemas/create-batch.schema";

export interface StepConfirmProps {
  readonly form: UseFormReturn<CaptureFormValues>;
}

type OccurredAtMode = "now" | "min30" | "hour1" | "custom";

const MODE_OFFSETS_MS: Readonly<Record<Exclude<OccurredAtMode, "custom">, number>> = Object.freeze({
  now: 0,
  min30: 30 * 60 * 1000,
  hour1: 60 * 60 * 1000
});

const MODE_LABELS: Readonly<Record<OccurredAtMode, string>> = Object.freeze({
  now: "Baru saja",
  min30: "±30 mnt",
  hour1: "±1 jam",
  custom: "Lainnya"
});

const MODE_TOLERANCE_MS = 90 * 1000;

function inferMode(iso: string): OccurredAtMode {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return "custom";
  const age = Date.now() - time;
  if (Math.abs(age) <= MODE_TOLERANCE_MS) return "now";
  if (Math.abs(age - MODE_OFFSETS_MS.min30) <= MODE_TOLERANCE_MS) return "min30";
  if (Math.abs(age - MODE_OFFSETS_MS.hour1) <= MODE_TOLERANCE_MS) return "hour1";
  return "custom";
}

function isoToLocalInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function SummaryRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-garis py-2 last:border-b-0">
      <dt className="text-sm text-ink-lemah">{label}</dt>
      <dd className="text-right text-sm text-ink">{value}</dd>
    </div>
  );
}

export function StepConfirm({ form }: StepConfirmProps) {
  const values = useWatch({ control: form.control });
  const occurredAt = values.occurredAt ?? "";
  const [mode, setMode] = useState<OccurredAtMode>(() => inferMode(occurredAt));

  const weight = parseKg(values.weightText ?? "");
  const fractions = values.aliran === "organik" ? buildFractionsFromForm({
    rinciEnabled: values.rinciEnabled ?? false,
    rinci: Object.fromEntries(
      Object.entries(values.rinci ?? {}).filter(
        (entry): entry is [string, string] => entry[1] !== undefined
      )
    ),
    dominant: values.dominant ?? "",
    extras: values.extras ?? []
  }) : null;

  const fractionSummary =
    fractions === null || !fractions.ok
      ? "—"
      : FRACTION_CODES.filter((code) => fractions.fractions[code] !== undefined)
          .map((code) => `${code} ${formatNumber(fractions.fractions[code] ?? 0, 0)}%`)
          .join(" · ");

  const setOccurredIso = (iso: string) => {
    form.setValue("occurredAt", iso, { shouldDirty: true, shouldValidate: true });
  };

  const pickMode = (next: OccurredAtMode) => {
    setMode(next);
    if (next === "custom") return;
    setOccurredIso(new Date(Date.now() - MODE_OFFSETS_MS[next]).toISOString());
  };

  const occurredError = form.formState.errors.occurredAt?.message;

  return (
    <div className="flex flex-col gap-6">
      <dl className="flex flex-col">
        <SummaryRow label="Berat" value={weight === null ? "—" : formatKg(weight, "manual")} />
        <SummaryRow label="Jenis" value={FLOW_LABELS[values.aliran ?? "organik"]} />
        {values.aliran === "organik" ? <SummaryRow label="Komposisi" value={fractionSummary} /> : null}
        <SummaryRow label="Berminyak" value={values.visibleOil === true ? "Ya" : "Tidak"} />
        <SummaryRow
          label="Kadar air"
          value={values.moistureProxy === "" || values.moistureProxy === undefined ? "Tidak diuji" : MOISTURE_LABELS[values.moistureProxy as MoistureProxy]}
        />
      </dl>

      <div role="group" aria-label="Waktu kejadian" className="flex flex-col gap-2">
        <p className="text-sm font-medium text-ink">Kapan diambil?</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(MODE_LABELS) as OccurredAtMode[]).map((entry) => (
            <ChipButton key={entry} selected={mode === entry} onClick={() => pickMode(entry)}>
              {MODE_LABELS[entry]}
            </ChipButton>
          ))}
        </div>
        {mode === "custom" ? (
          <Input
            type="datetime-local"
            aria-label="Waktu kejadian"
            value={isoToLocalInput(occurredAt)}
            onChange={(event) => {
              if (event.target.value === "") return;
              setOccurredIso(new Date(event.target.value).toISOString());
            }}
            className={cn(occurredError !== undefined && "border-bata")}
          />
        ) : null}
        {occurredError === undefined ? null : <p className="text-sm text-bata">{occurredError}</p>}
      </div>

      <p className="text-xs text-ink-lemah">
        Foto opsional menyusul di pembaruan berikutnya. Hindari wajah orang di foto.
      </p>
    </div>
  );
}