import { isApiError } from "@/api/api-error";
import { RouteStatusChip } from "@/features/routes/components/route-status-chip";
import { StopManifestList } from "@/features/routes/components/stop-manifest-list";
import { StopProgressStrip } from "@/features/routes/components/stop-progress-strip";
import { useConfirmStop } from "@/features/routes/hooks/use-confirm-stop";
import { useDriverRoute } from "@/features/routes/hooks/use-driver-route";
import { useFacilityNames } from "@/features/routes/hooks/use-facility-names";
import { ROUTE_SOURCE_LABELS } from "@/features/routes/route-labels";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { useDelayedLoading } from "@/shared/hooks/use-delayed-loading";
import { ROUTE_STOP_STATUS_LABELS } from "@/shared/constants/route.constant";
import { formatDateOnly, formatKg, formatNumber } from "@/shared/lib/format";
import type { ConfirmableStopStatus } from "@/shared/constants/route.constant";

export function DriverRoutePage() {
  const driverRoute = useDriverRoute();
  const facilityNames = useFacilityNames();
  const confirmStop = useConfirmStop();
  const showToast = useToastStore((state) => state.show);
  const showSkeleton = useDelayedLoading(driverRoute.listPending);

  const plan = driverRoute.plan;
  const detail = driverRoute.detail;
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

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Rute hari ini"
        description={
          plan === null ? "Pengangkutan limpahan untuk armada Anda." : `${formatDateOnly(plan.tanggal)} · ${ROUTE_SOURCE_LABELS[plan.source]}`
        }
      />

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

          {detail.data === undefined || detail.isPending ? null : (
            <>
              <StopProgressStrip stops={detail.data.stops} />
              <StopManifestList
                stops={detail.data.stops}
                facilityNames={facilityNames}
                actionsEnabled
                busy={confirmStop.isPending}
                onAction={(stop, status) => handleStopAction(stop.id, status)}
              />
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}