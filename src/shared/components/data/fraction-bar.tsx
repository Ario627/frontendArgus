import {
  FRACTION_CODES,
  FRACTION_LABELS,
  sumFractions,
  type FractionCode,
  type FractionValues
} from "@/shared/constants/fraction.constant";
import { cn } from "@/shared/lib/cn";
import { formatNumber } from "@/shared/lib/format";

const TONE_BG: Readonly<Record<FractionCode, string>> = Object.freeze({
  A: "bg-fraksi-a",
  B: "bg-fraksi-b",
  C: "bg-fraksi-c",
  D: "bg-fraksi-d",
  E: "bg-fraksi-e"
});

export interface FractionBarProps {
  readonly values: FractionValues;
  readonly className?: string;
}

export function FractionBar({ values, className }: FractionBarProps) {
  const entries = FRACTION_CODES.filter((code) => (values[code] ?? 0) > 0);
  if (entries.length === 0) {
    return <p className="text-sm text-ink-lemah">Komposisi belum dicatat.</p>;
  }
  const total = sumFractions(values);
  const remainder = Math.max(0, 100 - total);
  const label = entries
    .map((code) => `${code} ${FRACTION_LABELS[code]} ${formatNumber(values[code] ?? 0, 0)}%`)
    .join(", ");

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div role="img" aria-label={`Komposisi: ${label}`} className="flex h-2.5 w-full overflow-hidden rounded-full">
        {entries.map((code) => (
          <span key={code} className={TONE_BG[code]} style={{ width: `${values[code]}%` }} />
        ))}
        {remainder > 0 ? <span className="bg-garis" style={{ width: `${remainder}%` }} /> : null}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {entries.map((code) => (
          <li key={code} className="flex items-center gap-1.5 text-xs text-ink">
            <span aria-hidden className={cn("size-2 rounded-full", TONE_BG[code])} />
            <span className="font-mono">{code}</span>
            <span className="text-ink-lemah">{FRACTION_LABELS[code]}</span>
            <span className="font-mono tabular-nums">{formatNumber(values[code] ?? 0, 0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}