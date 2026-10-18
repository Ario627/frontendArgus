import { lazy, Suspense } from "react";
import { decodePolyline } from "@/features/navigation/geo";
import { useDirections } from "@/features/navigation/hooks/use-directions";
import type { PositionSource } from "@/features/navigation/hooks/use-driver-position";
import { ManeuverArrow } from "@/features/navigation/components/maneuver-arrow";
import { formatTravelDistance, formatTravelTime } from "@/features/navigation/geo";
import { Chip } from "@/shared/components/ui/chip";
import { cn } from "@/shared/lib/cn";
import type { LatLng } from "@/shared/types/maps.types";

const NavMap = lazy(() => import("@/features/navigation/components/nav-map"));

const ARRIVAL_RADIUS_METERS = 80;

export interface DriverNavPanelProps {
  readonly targetLabel: string;
  readonly target: LatLng;
  readonly position: LatLng | null;
  readonly positionSource: PositionSource | null;
}

export function DriverNavPanel({
  targetLabel,
  target,
  position,
  positionSource
}: DriverNavPanelProps) {
  const directions = useDirections(position, target, position !== null);
  const report = directions.data ?? null;

  if (position === null) {
    return (
      <section className="flex flex-col gap-1 rounded-kontainer border border-garis px-4 py-3">
        <p className="label-cap text-ink-lemah">Petunjuk arah</p>
        <p className="text-sm text-ink">
          Izinkan akses lokasi di perangkat ini untuk mendapatkan petunjuk arah ke {targetLabel}.
        </p>
      </section>
    );
  }

  const arrived = report !== null && report.distanceMeters <= ARRIVAL_RADIUS_METERS;
  const path = report?.polyline === null || report?.polyline === undefined
    ? []
    : decodePolyline(report.polyline);
  const steps = report?.steps ?? [];
  const nextStep = steps[0] ?? null;
  const following = steps.slice(1, 3);

  return (
    <section className="flex flex-col gap-3 rounded-kontainer border border-garis">
      <div className="flex items-start gap-3 px-4 pt-4">
        {nextStep === null ? null : (
          <ManeuverArrow
            maneuverType={nextStep.maneuverType}
            maneuverModifier={nextStep.maneuverModifier}
            bearingDeg={report?.bearingDeg ?? 0}
            className="mt-0.5 shrink-0"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="label-cap text-ink-lemah">
            {arrived ? "Tiba" : `Menuju ${targetLabel}`}
          </p>
          <p className="text-md font-medium text-ink">
            {arrived
              ? "Anda sudah di lokasi."
              : (nextStep?.instruction ?? "Menyusun petunjuk arah...")}
          </p>
          {nextStep === null || arrived ? null : (
            <p className="font-mono text-xs text-ink-lemah">
              langkah {formatTravelDistance(nextStep.distanceMeters)} · {formatTravelTime(nextStep.durationSeconds)}
            </p>
          )}
        </div>
      </div>

      {report === null ? null : (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-garis px-4 py-2.5">
          <span className="font-mono text-md tabular-nums text-ink">
            {formatTravelDistance(report.distanceMeters)}
          </span>
          <span className="font-mono text-sm tabular-nums text-ink-lemah">
            {formatTravelTime(report.durationSeconds)}
          </span>
          <span className="ml-auto flex items-center gap-2">
            {positionSource === null ? null : (
              <Chip className="h-6 text-2xs">
                {positionSource === "gps" ? "GPS perangkat" : "posisi armada"}
              </Chip>
            )}
            <Chip
              className={cn(
                "h-6 text-2xs",
                report.lowConfidence ? "border-kunyit/60 text-kunyit" : "border-daun/50 text-daun"
              )}
            >
              {report.source === "mapbox" ? "peta jalan" : "perkiraan garis lurus"}
            </Chip>
          </span>
        </div>
      )}

      {following.length > 0 ? (
        <ol className="flex flex-col border-t border-garis px-4 py-2">
          {following.map((step, index) => (
            <li key={index} className="flex items-center gap-2 py-1 text-xs text-ink-lemah">
              <span className="font-mono">{formatTravelDistance(step.distanceMeters)}</span>
              <span className="truncate">{step.instruction}</span>
            </li>
          ))}
        </ol>
      ) : null}

      {report === null ? null : (
        <div className="h-44 overflow-hidden border-t border-garis md:h-52">
          <Suspense
            fallback={<div className="grid h-full place-items-center text-xs text-ink-lemah">Memuat peta...</div>}
          >
            <NavMap from={position} to={target} path={path} />
          </Suspense>
        </div>
      )}

      {report?.lowConfidence === true ? (
        <p className="px-4 pb-3 text-xs text-kunyit">
          Belum ada data jalan untuk wilayah ini. Jarak dan waktu memakai perkiraan garis lurus.
        </p>
      ) : null}
    </section>
  );
}
