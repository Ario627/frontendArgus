import { useEffect, useMemo, useRef, useState } from "react";
import { isApiError } from "@/api/api-error";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { DriverNavPanel } from "@/features/navigation/components/driver-nav-panel";
import { useDriverPosition } from "@/features/navigation/hooks/use-driver-position";
import { RouteStatusChip } from "@/features/routes/components/route-status-chip";
import { StopManifestList } from "@/features/routes/components/stop-manifest-list";
import { StopProgressStrip } from "@/features/routes/components/stop-progress-strip";
import { TransferConfirmSheet } from "@/features/routes/components/transfer-confirm-sheet";
import { useConfirmStop } from "@/features/routes/hooks/use-confirm-stop";
import { useDriverRoute } from "@/features/routes/hooks/use-driver-route";
import { useFacilityDirectory } from "@/features/routes/hooks/use-facility-directory";
import { useFacilityNames } from "@/features/routes/hooks/use-facility-names";
import { useNewStopAlert } from "@/features/routes/hooks/use-new-stop-alert";
import { isStopClosed, ROUTE_SOURCE_LABELS } from "@/features/routes/route-labels";
import { useSppgDetail } from "@/features/sppg/hooks/use-sppg-detail";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ui/dialog";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { useDelayedLoading } from "@/shared/hooks/use-delayed-loading";
import { cn } from "@/shared/lib/cn";
import { formatDateOnly, formatKg, formatNumber, formatTime } from "@/shared/lib/format";
import { ROUTE_STOP_KIND_LABELS, ROUTE_STOP_STATUS_LABELS } from "@/shared/constants/route.constant";
import type { ConfirmableStopStatus } from "@/shared/constants/route.constant";
import type { RouteStopDto } from "@/shared/types/route.types";
import type { LatLng } from "@/shared/types/maps.types";

interface NavTarget {
  readonly label: string;
  readonly coords: LatLng;
}

export function DriverRoutePage() {
  const driverRoute = useDriverRoute();
  const facilityNames = useFacilityNames();
  const directory = useFacilityDirectory();
  const confirmStop = useConfirmStop();
  const fleetId = useAuthStore((state) => state.user?.fleetId ?? null);
  const position = useDriverPosition(fleetId);
  const showToast = useToastStore((state) => state.show);
  const showSkeleton = useDelayedLoading(driverRoute.listPending);

  const plan = driverRoute.plan;
  const detail = driverRoute.detail;
  const sppg = useSppgDetail(plan?.sppgId ?? null);
  const stops = useMemo(() => detail.data?.stops ?? [], [detail.data]);
  const alert = useNewStopAlert(plan?.id ?? null, stops);

  const [failTarget, setFailTarget] = useState<RouteStopDto | null>(null);
  const [transferBatchId, setTransferBatchId] = useState<string | null>(null);
  const announcedRef = useRef(0);

  useEffect(() => {
    if (alert.newCount > 0 && alert.newCount !== announcedRef.current) {
      announcedRef.current = alert.newCount;
      showToast({
        message:
          alert.newCount === 1
            ? "Ada 1 tugas baru di rute Anda."
            : `Ada ${alert.newCount} pembaruan pada rute Anda.`
      });
    }
  }, [alert.newCount, showToast]);

  const currentStop = stops.find((stop) => !isStopClosed(stop.status)) ?? null;
  const nextAfterCurrent =
    currentStop === null ? null : (stops[stops.indexOf(currentStop) + 1] ?? null);

  const target: NavTarget | null = useMemo(() => {
    if (currentStop === null) return null;
    if (currentStop.jenis === "AMBIL") {
      const sppgData = sppg.data;
      if (sppgData === undefined) return null;
      return {
        label: `sumber: ${sppgData.nama}`,
        coords: { lat: sppgData.lat, lng: sppgData.lng }
      };
    }
    if (currentStop.fasilitasId === null) return null;
    const facility = directory.get(currentStop.fasilitasId);
    if (facility === undefined) return null;
    return {
      label: `fasilitas: ${facility.nama}`,
      coords: { lat: facility.lat, lng: facility.lng }
    };
  }, [currentStop, sppg.data, directory]);

  const listError = isApiError(driverRoute.listError) ? driverRoute.listError : null;

  const handleStopAction = (stopId: string, status: ConfirmableStopStatus) => {
    if (plan === null) return;
    confirmStop.mutate(
      { planId: plan.id, stopId, status },
      {
        onSuccess: () => {
          showToast({ message: `Stop ditandai ${ROUTE_STOP_STATUS_LABELS[status].toLowerCase()}` });
        },
        onError: (cause) => {
          showToast({
            message: isApiError(cause) ? cause.message : "Tidak dapat menandai stop saat ini.",
            tone: "bata"
          });
        }
      }
    );
  };

  const nextLabel = (stop: RouteStopDto | null): string => {
    if (stop === null) return "Rute selesai setelah stop ini.";
    if (stop.jenis === "AMBIL") return "Lanjut ke titik ambil berikutnya.";
    const name =
      stop.fasilitasId === null
        ? "fasilitas"
        : (facilityNames.get(stop.fasilitasId) ?? `fasilitas ${stop.fasilitasId.slice(0, 8)}`);
    return `Lanjut antar ke ${name}.`;
  };

  const currentPlaceLabel = (stop: RouteStopDto): string => {
    if (stop.jenis === "AMBIL") {
      return sppg.data === undefined ? "sumber" : sppg.data.nama;
    }
    if (stop.fasilitasId === null) return "fasilitas";
    return facilityNames.get(stop.fasilitasId) ?? "fasilitas";
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Rute hari ini"
        description={
          plan === null
            ? "Pengangkutan limpahan untuk armada Anda."
            : `${formatDateOnly(plan.tanggal)} · ${ROUTE_SOURCE_LABELS[plan.source]}`
        }
      />

      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-lemah">
        <span className="font-mono text-2xs">ALUR</span>
        <span>ambil di dapur</span>
        <span aria-hidden>→</span>
        <span>bawa ke fasilitas</span>
        <span aria-hidden>→</span>
        <span>serah terima dua sisi</span>
      </p>

      {alert.newCount > 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-kontainer border border-kunyit/60 bg-kunyit/5 px-4 py-2.5">
          <p className="text-sm text-ink">
            {alert.newCount === 1
              ? "Ada 1 pembaruan baru di rute ini."
              : `Ada ${alert.newCount} pembaruan baru di rute ini.`}
          </p>
          <Button variant="secondary" size="sm" onClick={alert.acknowledge}>
            Tandai dibaca
          </Button>
        </div>
      ) : null}

      {showSkeleton ? <SkeletonList rows={5} /> : null}

      {listError !== null ? (
        <ErrorState
          description={listError.message}
          requestId={listError.requestId}
          onRetry={driverRoute.refetch}
        />
      ) : null}

      {!driverRoute.listPending && listError === null && plan === null ? (
        <EmptyState
          title="Tidak ada rute aktif hari ini."
          description="Rute muncul setelah admin menjalankan perencanaan. Pastikan perangkat armada menyala."
        />
      ) : null}

      {plan !== null ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-garis pb-4">
            <RouteStatusChip status={plan.status} />
            <span className="font-mono text-md tabular-nums text-ink">{formatKg(plan.totalKg)}</span>
            {plan.totalKm === null ? null : (
              <span className="font-mono text-sm tabular-nums text-ink-lemah">
                {formatNumber(plan.totalKm, 1)} km
              </span>
            )}
          </div>

          {detail.isPending ? <SkeletonList rows={4} /> : null}

          {detail.isError ? (
            <ErrorState
              description={
                isApiError(detail.error) ? detail.error.message : "Manifest tidak dapat dimuat."
              }
              requestId={isApiError(detail.error) ? detail.error.requestId : null}
              onRetry={() => void detail.refetch()}
            />
          ) : null}

          {stops.length === 0 ? null : (
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
              <div className="flex flex-col gap-3">
                {currentStop === null ? (
                  <section className="rounded-kontainer border border-daun/50 bg-daun/5 px-4 py-3">
                    <p className="text-sm text-ink">
                      Semua stop selesai. Rute ini tuntas — lapor admin bila ada kendala terakhir.
                    </p>
                  </section>
                ) : (
                  <section className="flex flex-col gap-3 rounded-kontainer border border-garis px-4 py-4 lg:px-5 lg:py-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col">
                        <span className="label-cap text-ink-lemah">Tugas saat ini</span>
                        <span className="text-md font-medium text-ink lg:text-lg">
                          {ROUTE_STOP_KIND_LABELS[currentStop.jenis]} {currentPlaceLabel(currentStop)}
                        </span>
                        <span className="mt-0.5 flex flex-wrap gap-x-3 font-mono text-xs text-ink-lemah">
                          <span>stop {currentStop.urutan}</span>
                          <span>batch {currentStop.batchId.slice(0, 8)}</span>
                          {currentStop.eta === null ? null : (
                            <span>ETA {formatTime(currentStop.eta)}</span>
                          )}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 font-mono text-2xs",
                          currentStop.status === "SAMPAI"
                            ? "border-biru-tinta/50 text-biru-tinta"
                            : "border-garis text-ink-lemah"
                        )}
                      >
                        {ROUTE_STOP_STATUS_LABELS[currentStop.status]}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {currentStop.status === "RENCANA" ? (
                        <Button
                          size="lg"
                          disabled={confirmStop.isPending}
                          onClick={() => handleStopAction(currentStop.id, "SAMPAI")}
                        >
                          Sampai di lokasi
                        </Button>
                      ) : null}
                      {currentStop.jenis === "AMBIL" && currentStop.status !== "SELESAI" ? (
                        <Button
                          size="lg"
                          variant="secondary"
                          onClick={() => setTransferBatchId(currentStop.batchId)}
                        >
                          Catat serah terima
                        </Button>
                      ) : null}
                      <Button
                        size="lg"
                        variant={currentStop.status === "SAMPAI" ? "primary" : "secondary"}
                        disabled={confirmStop.isPending}
                        onClick={() => handleStopAction(currentStop.id, "SELESAI")}
                      >
                        {currentStop.jenis === "AMBIL" ? "Muatan terangkut" : "Bongkar selesai"}
                      </Button>
                      <Button
                        size="lg"
                        variant="danger"
                        disabled={confirmStop.isPending}
                        onClick={() => setFailTarget(currentStop)}
                      >
                        Gagal
                      </Button>
                    </div>

                    <p className="text-xs text-ink-lemah">{nextLabel(nextAfterCurrent)}</p>
                  </section>
                )}

                {target === null ? null : (
                  <DriverNavPanel
                    targetLabel={target.label}
                    target={target.coords}
                    position={position.position}
                    positionSource={position.source}
                  />
                )}
              </div>

              <div className="flex flex-col gap-3">
                <StopProgressStrip stops={stops} />
                {detail.data === undefined ? null : (
                  <StopManifestList
                    stops={detail.data.stops}
                    facilityNames={facilityNames}
                    actionsEnabled={false}
                    busy={false}
                    onAction={() => undefined}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}

      <ConfirmDialog
        open={failTarget !== null}
        onOpenChange={(open) => {
          if (!open) setFailTarget(null);
        }}
        title="Tandai stop gagal?"
        description="Stop ditutup sebagai gagal dan tidak bisa diubah lagi. Sampaikan alasannya ke admin lewat telepon atau pesan."
        confirmLabel="Tandai gagal"
        tone="bahaya"
        onConfirm={() => {
          const failed = failTarget;
          setFailTarget(null);
          if (failed !== null) handleStopAction(failed.id, "GAGAL");
        }}
      />

      <TransferConfirmSheet
        batchId={transferBatchId}
        onOpenChange={(open) => {
          if (!open) setTransferBatchId(null);
        }}
        position={position.position}
        roleNote="Anda mencatat sebagai saksi pengirim. Pihak penerima melengkapi dari sisinya."
      />
    </div>
  );
}
