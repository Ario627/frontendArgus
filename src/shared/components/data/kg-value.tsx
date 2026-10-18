import { cn } from "@/shared/lib/cn";
import { formatKgValue, type KgSource } from "@/shared/lib/format";

export interface KgValueProps {
  readonly value: number | null;
  readonly source?: KgSource;
  readonly unit?: boolean;
  readonly className?: string;
}

export function KgValue({ value, source = "manual", unit = true, className }: KgValueProps) {
  if (value === null || !Number.isFinite(value)) {
    return <span className={cn("text-ink-lemah", className)}>Belum tersedia</span>;
  }
  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {formatKgValue(value, source)}
      {unit ? <span className="text-ink-lemah"> kg</span> : null}
    </span>
  );
}