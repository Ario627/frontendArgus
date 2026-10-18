import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { isApiError } from "@/api/api-error";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { PlanRouteSheet } from "@/features/routes/components/plan-route-sheet";
import { RouteTable } from "@/features/routes/components/route-table";
import { useRoutes, type RouteFilterState } from "@/features/routes/hooks/use-routes";
import { ROUTE_STATUSES, ROUTE_STATUS_LABELS, type RouteStatus } from "@/shared/constants/route.constant";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { useDelayedLoading } from "@/shared/hooks/use-delayed-loading";
import { formatDateOnly, formatInt } from "@/shared/lib/format";

function readFilters(params: URLSearchParams): RouteFilterState {
  const tanggal = params.get("tanggal") ?? "";
  const status = params.get("status") ?? "";
  return {
    ...(tanggal === "" ? {} : { tanggal }),
    ...(ROUTE_STATUSES.includes(status as RouteStatus) ? { status: status as RouteStatus } : {})
  };
}

export function RoutesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const role = useAuthStore((state) => state.role);
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const query = useRoutes(filters);
  const showSkeleton = useDelayedLoading(query.isPending);
  const apiError = isApiError(query.error) ? query.error : null;

  const [planOpen, setPlanOpen] = useState(false);
  const canPlan = role === "admin";
  const plans = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const hasFilters = filters.tanggal !== undefined || filters.status !== undefined;

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "") next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  return (
    <div className="flex max-w-5xl flex-col gap-5">
      <PageHeader
        title="Rute limpahan"
        description={
          query.data === undefined
            ? "Rencana pengangkutan per hari."
            : `${formatInt(total)} rencana tercatat.`
        }
        actions={
          canPlan ? (
            <Button variant="primary" size="sm" onClick={() => setPlanOpen(true)}>
              Rencanakan rute
            </Button>
          ) : null
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <label htmlFor="route-tanggal" className="flex flex-col gap-1">
          <span className="label-cap text-ink-lemah">Tanggal</span>
          <Input
            id="route-tanggal"
            type="date"
            value={filters.tanggal ?? ""}
            onChange={(event) => updateParam("tanggal", event.target.value)}
            className="w-40"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label-cap text-ink-lemah">Status</span>
          <Select
            value={filters.status ?? ""}
            onChange={(event) => updateParam("status", event.target.value)}
            className="w-52"
          >
            <option value="">Semua</option>
            {ROUTE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ROUTE_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </label>
        {hasFilters ? (
          <Button variant="ghost" size="sm" onClick={() => setSearchParams(new URLSearchParams())}>
            Hapus filter
          </Button>
        ) : null}
      </div>

      {showSkeleton ? <SkeletonList rows={6} /> : null}

      {query.isError ? (
        <ErrorState
          description={apiError?.message ?? "Periksa jaringan lalu coba lagi."}
          requestId={apiError?.requestId}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.data !== undefined && plans.length === 0 ? (
        hasFilters ? (
          <EmptyState
            title="Tidak ada rencana dengan filter ini."
            action={
              <Button variant="secondary" size="sm" onClick={() => setSearchParams(new URLSearchParams())}>
                Hapus filter
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="Belum ada rencana rute."
            description="Rencanakan rute untuk batch yang sudah menunggu angkut."
            action={
              canPlan ? (
                <Button variant="primary" size="sm" onClick={() => setPlanOpen(true)}>
                  Rencanakan rute
                </Button>
              ) : undefined
            }
          />
        )
      ) : null}

      {plans.length > 0 ? <RouteTable plans={plans} /> : null}

      {query.data !== undefined && filters.tanggal !== undefined && plans.length > 0 ? (
        <p className="text-xs text-ink-lemah">
          Menampilkan rencana {formatDateOnly(filters.tanggal)}.
        </p>
      ) : null}

      <PlanRouteSheet open={planOpen} onOpenChange={setPlanOpen} defaultDate={filters.tanggal ?? ""} />
    </div>
  );
}