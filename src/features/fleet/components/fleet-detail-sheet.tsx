import { isApiError } from "@/api/api-error";
import { useFleetTelemetry } from "@/features/fleet/hooks/use-fleet-telemetry";
import { FleetPositionsPanel } from "@/features/fleet/components/fleet-positions-panel";
import { FleetStatusChip } from "@/features/fleet/components/fleet-status-chip";
import { describeFleet, formatStaleness } from "@/features/fleet/liveness";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { Button } from "@/shared/components/ui/button";
import { Sheet } from "@/shared/components/ui/sheet";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/cn";
import { formatDateTime, formatKgValue, formatNumber } from "@/shared/lib/format";
import type { FleetDto } from "@/shared/types/fleet.types";

interface InfoRowProps {
  readonly label: string;
  readonly children: React.ReactNode;
}

function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-garis py-2 last:border-b-0">
      <dt className="shrink-0 text-sm text-ink-lemah">{label}</dt>
      <dd className="min-w-0 text-right text-sm text-ink">{children}</dd>
    </div>
  );
}

export interface FleetDetailSheetProps {
  readonly fleet: FleetDto | null;
  readonly onOpenChange: (open: boolean) => void;
  readonly onEdit?: () => void;
}

export function FleetDetailSheet({ fleet, onOpenChange, onEdit }: FleetDetailSheetProps) {
  const telemetry = useFleetTelemetry(fleet?.id ?? null);
  const apiError = isApiError(telemetry.error) ? telemetry.error : null;

  if (fleet === null) return null;

  const latest = telemetry.data?.latest ?? null;

  return (
    <Sheet
      open
      onOpenChange={onOpenChange}
      title={fleet.kode}
      description={describeFleet(fleet.statusOperasional, fleet.stalenessSeconds)}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3 border-b border-garis pb-4">
          <FleetStatusChip status={fleet.statusOperasional} />
          {fleet.aktif ? null : <span className="text-xs text-ink-lemah">Nonaktif</span>}
          {onEdit === undefined ? null : (
            <Button variant="secondary" size="sm" className="ml-auto" onClick={onEdit}>
              Ubah armada
            </Button>
          )}
        </div>

        <dl className="flex flex-col">
          <InfoRow label="Plat">{fleet.plat ?? "—"}</InfoRow>
          <InfoRow label="Pengemudi">{fleet.driverNama ?? "—"}</InfoRow>
          <InfoRow label="Kapasitas">
            {fleet.kapasitasKg === null ? "Belum diisi" : formatKgValue(fleet.kapasitasKg)}
          </InfoRow>
          <InfoRow label="Terakhir lapor">{formatStaleness(fleet.stalenessSeconds)}</InfoRow>
        </dl>

        {telemetry.isPending ? <SkeletonList rows={3} /> : null}

        {telemetry.isError ? (
          <ErrorState
            title="Telemetri tidak dapat dimuat"
            description={apiError?.message ?? "Periksa jaringan lalu coba lagi."}
            requestId={apiError?.requestId}
            onRetry={() => void telemetry.refetch()}
          />
        ) : null}

        {latest === null ? null : (
          <section className="flex flex-col">
            <h2 className="pb-1 text-sm font-medium text-ink">Laporan perangkat terakhir</h2>
            <dl className="flex flex-col">
              <InfoRow label="Waktu perangkat">
                <span className="font-mono text-xs">{formatDateTime(latest.deviceTimestamp)}</span>
              </InfoRow>
              {latest.speedKmh === null ? null : (
                <InfoRow label="Kecepatan">
                  <span className="font-mono text-xs tabular-nums">
                    {formatNumber(latest.speedKmh, 0)} km/j
                  </span>
                </InfoRow>
              )}
              {latest.volumePercent === null ? null : (
                <InfoRow label="Volume bak">
                  <span className="font-mono text-xs tabular-nums">
                    {formatNumber(latest.volumePercent, 0)}%
                  </span>
                </InfoRow>
              )}
              <InfoRow label="Perangkat">
                <span
                  className={cn(
                    "text-xs",
                    latest.hardwareStatus === "broken" ? "text-bata" : "text-ink"
                  )}
                >
                  {latest.hardwareStatus === "broken" ? "Melaporkan rusak" : "Normal"}
                </span>
              </InfoRow>
              {latest.lat === null || latest.lng === null ? null : (
                <InfoRow label="Posisi">
                  <span className="font-mono text-xs tabular-nums">
                    {formatNumber(latest.lat, 5)}, {formatNumber(latest.lng, 5)}
                  </span>
                </InfoRow>
              )}
            </dl>
          </section>
        )}

        {telemetry.data !== undefined && latest === null ? (
          <p className="text-sm text-ink-lemah">Perangkat belum pernah mengirim telemetri.</p>
        ) : null}

        <FleetPositionsPanel fleetId={fleet.id} />

        <p className="text-xs text-ink-lemah">
          Kontak pengemudi tidak ditampilkan di aplikasi ini.
        </p>
      </div>
    </Sheet>
  );
}