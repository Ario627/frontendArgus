import { FLEET_STATUS_TEXT } from "@/features/fleet/liveness";
import { FLEET_STATUS_TONES } from "@/features/fleet/liveness";
import type { FleetStatus } from "@/shared/constants/fleet.constant";
import type { StatusTone } from "@/shared/constants/tone.constant";
import { cn } from "@/shared/lib/cn";

const TONE_CHIP_CLASSES: Readonly<Record<StatusTone, string>> = Object.freeze({
  daun: "border-daun/50 text-daun",
  kunyit: "border-kunyit/50 text-kunyit",
  "biru-tinta": "border-biru-tinta/50 text-biru-tinta",
  bata: "border-bata/50 text-bata",
  netral: "border-garis text-ink-lemah"
});

export interface FleetStatusChipProps {
  readonly status: FleetStatus;
  readonly className?: string;
}

export function FleetStatusChip({ status, className }: FleetStatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2 text-xs whitespace-nowrap",
        TONE_CHIP_CLASSES[FLEET_STATUS_TONES[status]],
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          status === "ONLINE_NORMAL" && "bg-daun",
          status === "ONLINE_BROKEN" && "bg-bata",
          status === "STALE" && "bg-kunyit",
          status === "OFFLINE" && "bg-ink-lemah"
        )}
      />
      {FLEET_STATUS_TEXT[status]}
    </span>
  );
}