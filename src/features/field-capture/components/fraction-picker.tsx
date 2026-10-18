import { useWatch, type UseFormReturn } from "react-hook-form";
import { ChipButton } from "@/shared/components/ui/chip";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/cn";
import {
  FRACTION_CODES,
  FRACTION_LABELS,
  type FractionCode,
  type FractionValues
} from "@/shared/constants/fraction.constant";
import { fractionsFromQuick, parsePercent } from "@/shared/lib/fraction-input";
import { formatNumber } from "@/shared/lib/format";
import type { CaptureFormValues } from "@/features/field-capture/schemas/create-batch.schema";

const TONE_DOT_CLASSES: Readonly<Record<FractionCode, string>> = Object.freeze({
  A: "bg-fraksi-a",
  B: "bg-fraksi-b",
  C: "bg-fraksi-c",
  D: "bg-fraksi-d",
  E: "bg-fraksi-e"
});

export interface FractionPickerProps {
  readonly form: UseFormReturn<CaptureFormValues>;
}

export function FractionPicker({ form }: FractionPickerProps) {
  const dominant = useWatch({ control: form.control, name: "dominant" }) ?? "";
  const extras = useWatch({ control: form.control, name: "extras" }) ?? [];
  const rinciEnabled = useWatch({ control: form.control, name: "rinciEnabled" }) ?? false;
  const rinci = useWatch({ control: form.control, name: "rinci" }) ?? {};

  const dominantError = form.formState.errors.dominant?.message;
  const extrasList = extras as string[];
  const includesPlastic = dominant === "E" || extrasList.includes("E");

  const rinciErrors = form.formState.errors.rinci as
    | Record<string, { message?: string } | undefined>
    | undefined;

  let rinciTotal = 0;
  for (const code of FRACTION_CODES) {
    const raw = (rinci[code] ?? "").trim();
    if (raw === "") continue;
    const parsed = parsePercent(raw);
    if (parsed !== null) rinciTotal += parsed;
  }
  const rinciRemaining = Math.max(0, Math.round((100 - rinciTotal) * 100) / 100);
  const rinciOver = rinciTotal > 100;

  const toggleDominant = (code: FractionCode) => {
    form.setValue("dominant", dominant === code ? "" : code, { shouldDirty: true });
  };

  const toggleExtra = (code: FractionCode) => {
    const next = extrasList.includes(code)
      ? extrasList.filter((entry) => entry !== code)
      : [...extrasList, code];
    form.setValue("extras", next, { shouldDirty: true });
  };

  const openRinci = () => {
    const anyValue = FRACTION_CODES.some((code) => (rinci[code] ?? "").trim() !== "");
    if (!anyValue) {
      const quick = fractionsFromQuick({ dominant, extras: extrasList });
      const seeded: Record<string, string> = {};
      for (const code of FRACTION_CODES) {
        const value = quick[code];
        if (value !== undefined) seeded[code] = formatNumber(value, value % 1 === 0 ? 0 : 2);
      }
      form.setValue("rinci", seeded, { shouldDirty: true });
    }
    form.setValue("rinciEnabled", true, { shouldDirty: true });
  };

  const closeRinci = () => {
    form.setValue("rinciEnabled", false, { shouldDirty: true });
    form.setValue("rinci", {}, { shouldDirty: true });
  };

  return (
    <div className="flex flex-col gap-5">
      <div role="group" aria-label="Sisa paling banyak" className="flex flex-col gap-2">
        <p className="text-sm font-medium text-ink">Sisa apa yang paling banyak?</p>
        <div className="grid grid-cols-2 gap-2">
          {FRACTION_CODES.map((code) => {
            const selected = dominant === code;
            return (
              <button
                key={code}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleDominant(code)}
                className={cn(
                  "flex h-14 items-center gap-2.5 rounded-kontrol border px-3 text-left transition-colors duration-150 ease-out",
                  selected
                    ? "border-ink bg-ink text-kertas"
                    : "border-garis bg-kertas text-ink hover:border-ink-lemah"
                )}
              >
                <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", TONE_DOT_CLASSES[code])} />
                <span className="font-mono text-sm">{code}</span>
                <span className="min-w-0 text-sm">{FRACTION_LABELS[code]}</span>
              </button>
            );
          })}
        </div>
        {dominantError === undefined ? null : <p className="text-sm text-bata">{dominantError}</p>}
      </div>

      {dominant === "" ? null : (
        <div role="group" aria-label="Isi tambahan" className="flex flex-col gap-2">
          <p className="text-sm text-ink-lemah">Ada yang lain?</p>
          <div className="flex flex-wrap gap-2">
            {FRACTION_CODES.filter((code) => code !== dominant).map((code) => (
              <ChipButton
                key={code}
                selected={extrasList.includes(code)}
                onClick={() => toggleExtra(code)}
              >
                {code} {FRACTION_LABELS[code]}
              </ChipButton>
            ))}
          </div>
        </div>
      )}

      {includesPlastic ? (
        <p className="text-sm text-kunyit">Plastik merusak pengomposan. Pisahkan bila memungkinkan.</p>
      ) : null}

      {rinciEnabled ? (
        <div className="flex flex-col gap-3">
          {FRACTION_CODES.map((code) => (
            <div key={code} className="flex items-center gap-3">
              <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", TONE_DOT_CLASSES[code])} />
              <span className="min-w-0 flex-1 text-sm text-ink">
                <span className="font-mono">{code}</span> {FRACTION_LABELS[code]}
              </span>
              <div className="w-24 shrink-0">
                <Input
                  inputMode="decimal"
                  autoComplete="off"
                  suffix="%"
                  invalid={rinciErrors?.[code] !== undefined}
                  aria-label={`Persen fraksi ${code}`}
                  {...form.register(`rinci.${code}`)}
                />
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3">
            <p className={cn("text-sm", rinciOver ? "text-bata" : "text-ink-lemah")}>
              {rinciOver ? "Total melebihi 100%" : `Sisa tersedia: ${formatNumber(rinciRemaining, 0)}%`}
            </p>
            <button
              type="button"
              onClick={closeRinci}
              className="text-sm text-biru-tinta underline underline-offset-2"
            >
              Kembali ke cara cepat
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openRinci}
          className="self-start text-sm text-biru-tinta underline underline-offset-2"
        >
          Atur rinci (opsional)
        </button>
      )}
    </div>
  );
}