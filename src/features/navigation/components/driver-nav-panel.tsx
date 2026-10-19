import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouteAlternatives } from "@/features/navigation/hooks/use-route-alternatives";
import { useVoiceGuidance } from "@/features/navigation/hooks/use-voice-guidance";
import { ManeuverArrow } from "@/features/navigation/components/maneuver-arrow";
import { RouteAlternativePicker } from "@/features/navigation/components/route-alternative-picker";
import {
  bearingBetween,
  distanceMeters,
  formatTravelDistance,
  formatTravelTime
} from "@/features/navigation/geo";
import type { PositionSource } from "@/features/navigation/hooks/use-driver-position";
import { Button } from "@/shared/components/ui/button";
import { Chip, ChipButton } from "@/shared/components/ui/chip";
import { cn } from "@/shared/lib/cn";
import { MAP_TILE_LABEL } from "@/shared/lib/map-tiles";
import {
  CONGESTION_LABELS,
  CONGESTION_TONE,
  ROUTING_PROVIDER_LABELS
} from "@/shared/types/maps.types";
import type { LatLng } from "@/shared/types/maps.types";

const NavMap = lazy(() => import("@/features/navigation/components/nav-map"));

const ARRIVAL_RADIUS_METERS = 90;
const STEP_ADVANCE_RADIUS_METERS = 55;

const remainingAlong = (
  steps: readonly { readonly distanceMeters: number }[],
  fromIndex: number
): number => {
  let total = 0;
  for (let index = fromIndex; index < steps.length; index += 1) {
    total += steps[index]?.distanceMeters ?? 0;
  }
  return total;
};

const advanceIndex = (
  steps: readonly { readonly location: LatLng | null }[],
  position: LatLng
): number => {
  let index = 0;
  while (index < steps.length - 1) {
    const next = steps[index + 1];
    const location = next?.location ?? null;
    if (location === null) break;
    if (distanceMeters(position, location) > STEP_ADVANCE_RADIUS_METERS) break;
    index += 1;
  }
  return index;
};

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
  const route = useRouteAlternatives(position, target, position !== null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const report = route.data ?? null;
  const alternatives = useMemo(() => report?.alternatives ?? [], [report]);
  const activeId =
    selectedId !== null && alternatives.some((entry) => entry.id === selectedId)
      ? selectedId
      : (report?.recommendedId ?? alternatives[0]?.id ?? null);
  const active = useMemo(
    () => alternatives.find((entry) => entry.id === activeId) ?? null,
    [alternatives, activeId]
  );
  const steps = useMemo(() => active?.steps ?? [], [active]);
  const stepIndex = position === null ? 0 : advanceIndex(steps, position);
  const nextStep = steps[stepIndex] ?? null;
  const voice = useVoiceGuidance();
  const announcedRef = useRef<Set<string>>(new Set());

  const distanceToTarget = position === null ? null : distanceMeters(position, target);
  const arrived =
    distanceToTarget !== null && active !== null && distanceToTarget <= ARRIVAL_RADIUS_METERS;
  const nextLocation = nextStep?.location ?? null;
  const nextDistance =
    position === null
      ? null
      : nextLocation === null
        ? distanceToTarget
        : distanceMeters(position, nextLocation);
  const speak = voice.speak;

  useEffect(() => {
    if (!voice.enabled || position === null || nextDistance === null) return;
    if (arrived) {
      const key = `arrive:${activeId ?? "-"}`;
      if (announcedRef.current.has(key)) return;
      announcedRef.current.add(key);
      speak("Anda sudah tiba di lokasi tujuan.");
      return;
    }
    if (nextStep === null) return;
    const bucket =
      nextDistance <= 60 ? 60 : nextDistance <= 150 ? 150 : nextDistance <= 400 ? 400 : 0;
    const key = `${activeId ?? "-"}:${stepIndex}:${bucket}`;
    if (announcedRef.current.has(key)) return;
    announcedRef.current.add(key);
    const instruction = nextStep.instruction;
    if (bucket === 0) {
      const eta = active === null ? "" : `. Perkiraan tiba ${formatTravelTime(active.durationInTrafficSeconds)}`;
      speak(`${instruction}. ${formatTravelDistance(nextDistance)} lagi${eta}.`);
    } else if (bucket === 400) {
      speak(`Dalam 400 meter, ${instruction}`);
    } else if (bucket === 150) {
      speak(`Dalam 150 meter, ${instruction}`);
    } else {
      speak(`Sebentar lagi, ${instruction}`);
    }
  }, [active, activeId, arrived, nextDistance, nextStep, position, speak, stepIndex, voice.enabled]);

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

  const targetDistance = distanceToTarget ?? 0;
  const remaining = remainingAlong(steps, stepIndex);
  const following = steps.slice(stepIndex + 1, stepIndex + 3);
  const bearing =
    nextStep?.location === null || nextStep?.location === undefined
      ? bearingBetween(position, target)
      : bearingBetween(position, nextStep.location);
  const tone = active === null ? null : CONGESTION_TONE[active.congestion];

  return (
    <section className="flex flex-col gap-3 rounded-kontainer border border-garis lg:gap-4">
      <div className="flex items-start gap-3 px-4 pt-4 lg:px-5 lg:pt-5">
        {nextStep === null || arrived ? null : (
          <ManeuverArrow
            maneuverType={nextStep.maneuverType}
            maneuverModifier={nextStep.maneuverModifier}
            bearingDeg={Math.round(bearing)}
            className="mt-0.5 shrink-0"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="label-cap text-ink-lemah">
            {arrived ? "Tiba" : `Menuju ${targetLabel}`}
          </p>
          <p className="text-md font-medium text-ink lg:text-lg">
            {arrived
              ? "Anda sudah di lokasi."
              : (nextStep?.instruction ??
                (route.isPending ? "Menyusun petunjuk arah..." : "Ikuti jalur yang dipilih."))}
          </p>
          {nextStep === null || arrived ? null : (
            <p className="font-mono text-xs text-ink-lemah">
              langkah {formatTravelDistance(nextStep.distanceMeters)} ·{" "}
              {formatTravelTime(nextStep.durationSeconds)}
            </p>
          )}
        </div>
      </div>

      {active === null ? null : (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-garis px-4 py-2.5 lg:px-5">
          <span className="font-mono text-md tabular-nums text-ink">
            {formatTravelTime(active.durationInTrafficSeconds)}
          </span>
          <span className="font-mono text-sm tabular-nums text-ink-lemah">
            {formatTravelDistance(targetDistance)} tersisa dari {formatTravelDistance(active.distanceMeters)}
          </span>
          <span className="ml-auto flex flex-wrap items-center gap-2">
            {voice.supported ? (
              <ChipButton selected={voice.enabled} onClick={voice.toggle}>
                {voice.enabled ? "Suara aktif" : "Suara mati"}
              </ChipButton>
            ) : null}
            {voice.supported && voice.lastSpoken !== null ? (
              <Button variant="ghost" size="sm" onClick={voice.repeat}>
                Ulangi
              </Button>
            ) : null}
            {positionSource === null ? null : (
              <Chip className="h-6 text-2xs">
                {positionSource === "gps" ? "GPS perangkat" : "posisi armada"}
              </Chip>
            )}
            <Chip className={cn("h-6 text-2xs", tone?.chip)}>
              {CONGESTION_LABELS[active.congestion]}
            </Chip>
            {report === null ? null : (
              <Chip
                className={cn(
                  "h-6 text-2xs",
                  report.trafficAware ? "border-biru-tinta/40 text-biru-tinta" : "border-kunyit/60 text-kunyit"
                )}
              >
                {ROUTING_PROVIDER_LABELS[report.provider]}
              </Chip>
            )}
            <Chip className="h-6 text-2xs">peta {MAP_TILE_LABEL}</Chip>
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3 px-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-5 lg:px-5">
        <div className="flex flex-col gap-3">
          <RouteAlternativePicker
            alternatives={alternatives}
            selectedId={activeId ?? ""}
            recommendedId={report?.recommendedId ?? ""}
            onSelect={setSelectedId}
          />

          {following.length > 0 ? (
            <ol className="flex flex-col border-t border-garis pt-2">
              {following.map((step, index) => (
                <li
                  key={`${stepIndex}-${index}`}
                  className="flex items-center gap-2 py-1 text-xs text-ink-lemah"
                >
                  <span className="font-mono">{formatTravelDistance(step.distanceMeters)}</span>
                  <span className="truncate">{step.instruction}</span>
                </li>
              ))}
            </ol>
          ) : null}

          {remaining > 0 ? (
            <p className="font-mono text-2xs text-ink-lemah">
              sisa jalur setelah langkah ini {formatTravelDistance(remaining)}
            </p>
          ) : null}
        </div>

        <div className="h-56 overflow-hidden rounded-kontrol border border-garis lg:h-72">
          <Suspense
            fallback={
              <div className="grid h-full place-items-center text-xs text-ink-lemah">Memuat peta...</div>
            }
          >
            <NavMap
              from={position}
              to={target}
              alternatives={alternatives}
              selectedId={activeId ?? ""}
            />
          </Suspense>
        </div>
      </div>

      {report?.note === null || report === null ? null : (
        <p className="px-4 pb-3 text-xs text-kunyit lg:px-5">{report.note}</p>
      )}
    </section>
  );
}
