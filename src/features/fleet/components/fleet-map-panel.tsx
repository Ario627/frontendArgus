import { lazy, Suspense } from "react";
import { formatStaleness } from "@/features/fleet/liveness";
import { cn } from "@/shared/lib/cn";
import { formatNumber } from "@/shared/lib/format";
import type { FleetDto } from "@/shared/types/fleet.types";

const FleetMap = lazy(() => import("@/features/fleet/components/fleet-map"));

export interface FleetMapPanelProps {
  readonly fleets: readonly FleetDto[];
  readonly className?: string;
}

function externalMapHref(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat.toFixed(5)}&mlon=${lng.toFixed(5)}#map=16/${lat.toFixed(5)}/${lng.toFixed(5)}`;
}

export function FleetMapPanel({ fleets, className }: FleetMapPanelProps) {
  const positioned = fleets.filter(
    (fleet) => fleet.lastLat !== null && fleet.lastLng !== null
  );

  if (positioned.length === 0) {
    return (
      <p className={cn("text-sm text-ink-lemah", className)}>
        Belum ada posisi armada yang dilaporkan.
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="h-72 overflow-hidden rounded-kontainer border border-garis md:h-80">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center bg-kertas">
              <p className="text-sm text-ink-lemah">Memuat peta…</p>
            </div>
          }
        >
          <FleetMap fleets={fleets} />
        </Suspense>
      </div>

      <details className="rounded-kontainer border border-garis">
        <summary className="cursor-pointer px-3 py-2 text-xs text-ink-lemah">
          Daftar koordinat dan tautan peta eksternal
        </summary>
        <ul className="flex flex-col border-t border-garis">
          {positioned.map((fleet) => (
            <li
              key={fleet.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-garis px-3 py-2 last:border-b-0"
            >
              <span className="font-mono text-xs text-ink">{fleet.kode}</span>
              <span className="font-mono text-2xs tabular-nums text-ink-lemah">
                {formatNumber(fleet.lastLat ?? 0, 5)}, {formatNumber(fleet.lastLng ?? 0, 5)} ·{" "}
                {formatStaleness(fleet.stalenessSeconds)}
              </span>
              <a
                href={externalMapHref(fleet.lastLat ?? 0, fleet.lastLng ?? 0)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-biru-tinta underline underline-offset-2"
              >
                Buka di peta eksternal
              </a>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}