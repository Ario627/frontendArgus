import { useState } from "react";
import { useFleetPositions } from "@/features/fleet/hooks/use-fleet-positions";
import { ChipButton } from "@/shared/components/ui/chip";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { formatNumber, formatTime } from "@/shared/lib/format";
import type { TelemetryPointDto } from "@/shared/types/fleet.types";

const WINDOWS: readonly { readonly minutes: number; readonly label: string }[] = Object.freeze([
  { minutes: 60, label: "1 jam" },
  { minutes: 180, label: "3 jam" },
  { minutes: 360, label: "6 jam" }
]);

const CHART_WIDTH = 280;
const CHART_HEIGHT = 48;
const CHART_PADDING = 4;

function SpeedSparkline({ points }: { readonly points: readonly TelemetryPointDto[] }) {
  const speeds = points
    .map((point) => point.speedKmh)
    .filter((value): value is number => value !== null);
  if (speeds.length < 2) {
    return <p className="text-xs text-ink-lemah">Data kecepatan belum cukup untuk grafik.</p>;
  }
  const max = Math.max(...speeds, 1);
  const step = (CHART_WIDTH - CHART_PADDING * 2) / (speeds.length - 1);
  const path = speeds
    .map((speed, index) => {
      const x = CHART_PADDING + index * step;
      const y =
        CHART_HEIGHT - CHART_PADDING - ((CHART_HEIGHT - CHART_PADDING * 2) * speed) / max;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      role="img"
      aria-label={`Kecepatan terakhir, puncak ${formatNumber(max, 0)} kilometer per jam`}
      className="h-12 w-full text-biru-tinta"
    >
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export interface FleetPositionsPanelProps {
  readonly fleetId: string;
}

export function FleetPositionsPanel({ fleetId }: FleetPositionsPanelProps) {
  const [minutes, setMinutes] = useState(180);
  const query = useFleetPositions(fleetId, minutes);
  const points = query.data?.points ?? [];
  const withPosition = points.filter((point) => point.lat !== null && point.lng !== null);

  return (
    <section className="flex flex-col gap-3 border-t border-garis pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-ink">Riwayat lintasan</h2>
        <div className="flex gap-2" role="group" aria-label="Rentang waktu lintasan">
          {WINDOWS.map((option) => (
            <ChipButton
              key={option.minutes}
              selected={minutes === option.minutes}
              onClick={() => setMinutes(option.minutes)}
            >
              {option.label}
            </ChipButton>
          ))}
        </div>
      </div>

      {query.isPending ? <SkeletonList rows={2} /> : null}

      {query.isError ? (
        <p className="text-sm text-bata">Riwayat lintasan tidak dapat dimuat.</p>
      ) : null}

      {query.data !== undefined && points.length === 0 ? (
        <p className="text-sm text-ink-lemah">
          Tidak ada laporan posisi dalam rentang ini.
        </p>
      ) : null}

      {withPosition.length > 0 ? (
        <div className="flex flex-col gap-2">
          <SpeedSparkline points={points} />
          <p className="flex flex-wrap gap-x-3 text-xs text-ink-lemah">
            <span className="font-mono">{points.length} laporan</span>
            <span>
              pertama {formatTime(points[0]?.receivedAt ?? "")} · terakhir{" "}
              {formatTime(points[points.length - 1]?.receivedAt ?? "")}
            </span>
          </p>
        </div>
      ) : null}

      {query.data !== undefined && points.length > 0 && withPosition.length === 0 ? (
        <p className="text-sm text-ink-lemah">
          Laporan masuk tanpa koordinat (perangkat tidak mengunci sinyal GPS).
        </p>
      ) : null}
    </section>
  );
}
