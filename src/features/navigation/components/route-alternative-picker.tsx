import { cn } from "@/shared/lib/cn";
import { formatTravelDistance, formatTravelTime } from "@/features/navigation/geo";
import {
  CONGESTION_HINTS,
  CONGESTION_LABELS,
  CONGESTION_TONE
} from "@/shared/types/maps.types";
import type { RouteAlternativeDto } from "@/shared/types/maps.types";

export interface RouteAlternativePickerProps {
  readonly alternatives: readonly RouteAlternativeDto[];
  readonly selectedId: string;
  readonly recommendedId: string;
  readonly onSelect: (id: string) => void;
}

export function RouteAlternativePicker({
  alternatives,
  selectedId,
  recommendedId,
  onSelect
}: RouteAlternativePickerProps) {
  if (alternatives.length <= 1) return null;

  return (
    <div role="radiogroup" aria-label="Pilihan jalur" className="flex flex-col gap-1.5">
      {alternatives.map((alternative) => {
        const tone = CONGESTION_TONE[alternative.congestion];
        const active = alternative.id === selectedId;
        const recommended = alternative.id === recommendedId;
        return (
          <button
            key={alternative.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(alternative.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-kontrol border px-3 py-2 text-left transition-colors",
              active ? "border-biru-tinta bg-biru-tinta/5" : "border-garis hover:border-ink-lemah"
            )}
          >
            <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", tone.dot)} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex items-center gap-2">
                <span className="truncate text-sm text-ink">{alternative.label}</span>
                {recommended ? (
                  <span className="shrink-0 rounded-full border border-daun/50 px-2 font-mono text-2xs text-daun">
                    disarankan
                  </span>
                ) : null}
              </span>
              <span className="truncate font-mono text-2xs text-ink-lemah">
                {tone === undefined ? "" : `${CONGESTION_LABELS[alternative.congestion]} · `}
                {formatTravelTime(alternative.durationInTrafficSeconds)} ·{" "}
                {formatTravelDistance(alternative.distanceMeters)}
                {alternative.via === null ? "" : ` · lewat ${alternative.via}`}
              </span>
            </span>
            <span className={cn("shrink-0 text-2xs", tone.text)}>
              {CONGESTION_HINTS[alternative.congestion]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
