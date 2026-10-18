import { useState } from "react";
import { Link, useParams } from "react-router";
import { isApiError } from "@/api/api-error";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { RouteStatusChip } from "@/features/routes/components/route-status-chip";
import { RouteSummaryPanel } from "@/features/routes/components/route-summary-panel";
import { StopManifestList } from "@/features/routes/components/stop-manifest-list";
import { StopProgressStrip } from "@/features/routes/components/stop-progress-strip";
import { useConfirmStop } from "@/features/routes/hooks/use-confirm-stop";
import { useFacilityNames } from "@/features/routes/hooks/use-facility-names";
import { useReplanRoute } from "@/features/routes/hooks/use-replan-route";
import { useRouteDetail } from "@/features/routes/hooks/use-route-detail";
import { ROUTE_SOURCE_LABELS } from "@/features/routes/route-labels";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ui/dialog";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Skeleton, SkeletonList } from "@/shared/components/ui/skeleton";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { ROUTE_STOP_STATUS_LABELS } from "@/shared/constants/route.constant";
import { formatDateOnly, formatInt, formatKg, formatNumber } from "@/shared/lib/format";
import type { ConfirmableStopStatus } from "@/shared/constants/route.constant";

const REPLANNABLE_STATUSES: ReadonlySet<string> = new Set(["AKTIF", "NEEDS_MANUAL_SCHEDULING"]);

export function RouteDetailPage() {
  const params = useParams();
  const planId = typeof params.planId === "string" ? params.planId : undefined;
  const role = useAuthStore((state) => state.role);
  const query = useRouteDetail(planId);
  const facilityNames = useFacilityNames();
  const confirmStop = useConfirmStop();
  const replan = useReplanRoute();
  const showToast = useToastStore((state) => state.show);
  const [replanOpen, setReplanOpen] = useState(false);

  const apiError = isApiError(query.error) ? query.error : null;

  if (query.isPending) {
    return (
      <div className="flex max-w-3xl flex-col gap-4">
        <Skeleton className="h-6 w-40" />
        <SkeletonList rows={5} />
      </div>
    );
  }

  if (query.isError || query.data === undefined) {
    return (
      <div className="max-w-3xl">
        <ErrorState
          description={apiError?.message ?? "Rute tidak dapat dimuat."}
          requestId={apiError?.requestId}
          onRetry={() => void query.refetch()}
        />
      </div>
    );
  }

  const plan = query.data;
  const canAct = role === "admin" || role === "driver";
  const canReplan = role === "admin" && REPLANNABLE_STATUSES.has(plan.status);

  const handleStopAction = (stopId: string, status: ConfirmableStopStatus) => {
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
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Detail rute"
        breadcrumb={[{ label: "Rute", to: "/routes" }, { label: formatDateOnly(plan.tanggal) }]}
        description={`${ROUTE_SOURCE_LABELS[plan.source]} · ${formatInt(plan.stops.length)} stop`}
        actions={
          canReplan ? (
            <Button variant="secondary" size="sm" onClick={() => setReplanOpen(true)}>
              Re-plan
            </Button>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-garis pb-5">
        <RouteStatusChip status={plan.status} />
        <span className="font-mono text-sm tabular-nums text-ink">{formatKg(plan.totalKg)}</span>
        {plan.totalKm === null ? null : (
          <span className="font-mono text-sm tabular-nums text-ink-lemah">
            {formatNumber(plan.totalKm, 1)} km
          </span>
        )}
      </div>

      <StopProgressStrip stops={plan.stops} />

      {plan.ringkasan === null ? null : (
        <RouteSummaryPanel summary={plan.ringkasan} lowConfidence={plan.lowConfidence} />
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-ink">Manifest stop</h2>
        <StopManifestList
          stops={plan.stops}
          facilityNames={facilityNames}
          actionsEnabled={canAct && plan.status === "AKTIF"}
          busy={confirmStop.isPending}
          onAction={(stop, status) => handleStopAction(stop.id, status)}
        />
      </section>

      <ConfirmDialog
        open={replanOpen}
        onOpenChange={setReplanOpen}
        title="Buat ulang rute ini?"
        description="Rute saat ini dibatalkan dan diganti rencana baru dari batch yang masih menunggu angkut."
        confirmLabel="Re-plan sekarang"
        pending={replan.isPending}
        onConfirm={() => {
          replan.mutate(plan.id, {
            onSuccess: (result) => {
              setReplanOpen(false);
              showToast({
                message: result.degraded
                  ? "Rute baru dibuat tanpa optimizer — perlu penjadwalan manual"
                  : "Rute baru dibuat"
              });
            },
            onError: (cause) => {
              setReplanOpen(false);
              showToast({
                message: isApiError(cause) ? cause.message : "Tidak dapat membuat ulang rute.",
                tone: "bata"
              });
            }
          });
        }}
      />

      <p className="text-xs text-ink-lemah">
        <Link to="/routes" className="text-biru-tinta underline underline-offset-2">
          Kembali ke daftar rute
        </Link>
      </p>
    </div>
  );
}