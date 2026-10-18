import type { RouteStopStatus } from "@/shared/constants/route.constant";
import type { RouteStopDto } from "@/shared/types/route.types";
import { cn } from "@/shared/lib/cn";
import { formatInt } from "@/shared/lib/format";

const SEGMENT_CLASSES: Readonly<Record<RouteStopStatus, string>> = Object.freeze({
  RENCANA: "border border-ink-lemah/60 bg-kertas",
  SAMPAI: "bg-biru-tinta",
  SELESAI: "bg-ink",
  GAGAL: "bg-bata"
});

export interface StopProgressStripProps {
  readonly stops: readonly RouteStopDto[];
  readonly className?: string;
}

export function StopProgressStrip({ stops, className }: StopProgressStripProps) {
  if (stops.length === 0) return null;
  const done = stops.filter((stop) => stop.status === "SELESAI").length;
  const failed = stops.filter((stop) => stop.status === "GAGAL").length;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        role="img"
        aria-label={`Progres rute: ${done} selesai, ${failed} gagal, dari ${stops.length} stop`}
        className="flex h-2.5 gap-1"
      >
        {stops.map((stop) => (
          <span
            key={stop.id}
            className={cn("h-full flex-1 rounded-sm", SEGMENT_CLASSES[stop.status])}
          />
        ))}
      </div>
      <p className="font-mono text-2xs text-ink-lemah">
        {formatInt(done)}/{formatInt(stops.length)} selesai
        {failed > 0 ? ` · ${formatInt(failed)} gagal` : ""}
      </p>
    </div>
  );
}