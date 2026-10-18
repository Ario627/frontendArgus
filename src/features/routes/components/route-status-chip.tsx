import { ROUTE_STATUS_LABELS, type RouteStatus } from "@/shared/constants/route.constant";
import { ROUTE_STATUS_TONES } from "@/features/routes/route-labels";
import type { StatusTone } from "@/shared/constants/tone.constant";
import { cn } from "@/shared/lib/cn";

const TONE_CLASSES: Readonly<Record<StatusTone, string>> = Object.freeze({
  daun: "border-daun/50 text-daun",
  kunyit: "border-kunyit/50 text-kunyit",
  "biru-tinta": "border-biru-tinta/50 text-biru-tinta",
  bata: "border-bata/50 text-bata",
  netral: "border-garis text-ink-lemah"
});

export interface RouteStatusChipProps {
  readonly status: RouteStatus;
  readonly className?: string;
}

export function RouteStatusChip({ status, className }: RouteStatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2 font-mono text-2xs whitespace-nowrap",
        TONE_CLASSES[ROUTE_STATUS_TONES[status]],
        className
      )}
    >
      {ROUTE_STATUS_LABELS[status]}
    </span>
  );
}