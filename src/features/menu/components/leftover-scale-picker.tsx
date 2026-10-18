import { PlateGlyph } from "@/shared/components/data/plate-scale";
import { LEFTOVER_LABELS, LEFTOVER_SCALE, type LeftoverLevel } from "@/shared/constants/leftover.constant";
import { cn } from "@/shared/lib/cn";

const LEVEL_SHORT_LABELS: Readonly<Record<LeftoverLevel, string>> = Object.freeze({
  0: "Habis",
  1: "Sedikit",
  2: "Separuh",
  3: "Banyak",
  4: "Penuh"
});

export interface LeftoverScalePickerProps {
  readonly value: LeftoverLevel | null;
  readonly onChange: (level: LeftoverLevel) => void;
  readonly invalid?: boolean;
  readonly ariaLabel?: string;
}

export function LeftoverScalePicker({
  value,
  onChange,
  invalid = false,
  ariaLabel = "Tingkat sisa"
}: LeftoverScalePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <div
        role="group"
        aria-label={ariaLabel}
        className={cn("grid grid-cols-5 gap-1.5", invalid && "rounded-kontainer outline outline-bata")}
      >
        {LEFTOVER_SCALE.map((level) => {
          const selected = value === level;
          return (
            <button
              key={level}
              type="button"
              aria-pressed={selected}
              aria-label={`Tingkat ${level}: ${LEFTOVER_LABELS[level]}`}
              onClick={() => onChange(level)}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-kontrol border px-1 py-1.5 transition-colors duration-150 ease-out",
                selected
                  ? "border-ink bg-ink text-kertas"
                  : "border-garis bg-kertas text-ink hover:border-ink-lemah"
              )}
            >
              <PlateGlyph level={level} size={22} />
              <span className="text-2xs">{LEVEL_SHORT_LABELS[level]}</span>
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="text-xs text-ink-lemah">
        {value === null
          ? "Pilih tingkat sisa sesuai pengamatan di titik distribusi."
          : `Tingkat ${value} — ${LEFTOVER_LABELS[value]}.`}
      </p>
    </div>
  );
}