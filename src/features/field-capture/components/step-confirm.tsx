import { useState } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { ChipButton } from "@/shared/components/ui/chip";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/cn";
import { FRACTION_CODES } from "@/shared/constants/fraction.constant";
import { FLOW_LABELS, MOISTURE_LABELS, type MoistureProxy } from "@/shared/constants/flow.constant";
import { buildFractionsFromForm } from "@/shared/lib/fraction-input";
import { formatKg, formatNumber, parseKg } from "@/shared/lib/format";
import {
  OCCURRED_AT_MODE_LABELS,
  occurredAtIsoFor,
  inferOccurredAtMode,
  isoToLocalInputValue,
  OCCURRED_AT_MODES,
  type OccurredAtMode
} from "@/shared/lib/occurred-at";
import type { CaptureFormValues } from "@/features/field-capture/schemas/create-batch.schema";

export interface StepConfirmProps {
  readonly form: UseFormReturn<CaptureFormValues>;
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
  const [mode, setMode] = useState<OccurredAtMode>(() => inferOccurredAtMode(occurredAt));

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
    setOccurredIso(occurredAtIsoFor(next));
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
          {OCCURRED_AT_MODES.map((entry) => (
            <ChipButton key={entry} selected={mode === entry} onClick={() => pickMode(entry)}>
              {OCCURRED_AT_MODE_LABELS[entry]}
            </ChipButton>
          ))}
        </div>
        {mode === "custom" ? (
          <Input
            type="datetime-local"
            aria-label="Waktu kejadian"
            value={isoToLocalInputValue(occurredAt)}
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
        Periksa sekali lagi sebelum disimpan — catatan buku besar tidak bisa diubah setelah tercatat.
      </p>
    </div>
  );
}