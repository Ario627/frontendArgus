import { useState } from "react";
import { useSearchParams } from "react-router";
import { isApiError } from "@/api/api-error";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { InsightList } from "@/features/menu/components/insight-list";
import { MenuItemSheet } from "@/features/menu/components/menu-item-sheet";
import { ObservationSheet } from "@/features/menu/components/observation-sheet";
import { useMenuInsights } from "@/features/menu/hooks/use-menu-insights";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { useDelayedLoading } from "@/shared/hooks/use-delayed-loading";
import { formatDateOnly, wibIsoDate } from "@/shared/lib/format";

const DEFAULT_WINDOW_DAYS = 14;

export function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const role = useAuthStore((state) => state.role);
  const sppgId = useAuthStore((state) => state.user?.sppgId ?? null);

  const today = wibIsoDate(0);
  const defaultFrom = wibIsoDate(DEFAULT_WINDOW_DAYS - 1);
  const rawFrom = searchParams.get("dari") ?? defaultFrom;
  const rawTo = searchParams.get("ke") ?? today;
  const from = rawFrom <= rawTo ? rawFrom : rawTo;
  const to = rawFrom <= rawTo ? rawTo : rawFrom;

  const scopeSppgId = role === "sppg_staff" ? sppgId : null;
  const insights = useMenuInsights({ sppgId: scopeSppgId, from, to });
  const showSkeleton = useDelayedLoading(insights.isPending);
  const apiError = isApiError(insights.error) ? insights.error : null;

  const [observationOpen, setObservationOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);

  const canObserve = role === "sppg_staff" && sppgId !== null;
  const canManageItems = role === "admin";

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "") next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <PageHeader
        title="Cermin menu"
        description="Item yang paling banyak tersisa — dasar untuk memperbaiki menu berikutnya."
        actions={
          <>
            {canObserve ? (
              <Button variant="primary" size="sm" onClick={() => setObservationOpen(true)}>
                Catat observasi
              </Button>
            ) : null}
            {canManageItems ? (
              <Button variant="secondary" size="sm" onClick={() => setItemOpen(true)}>
                Tambah item
              </Button>
            ) : null}
          </>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <label htmlFor="menu-dari" className="flex flex-col gap-1">
          <span className="label-cap text-ink-lemah">Dari</span>
          <Input
            id="menu-dari"
            type="date"
            value={from}
            onChange={(event) => updateParam("dari", event.target.value)}
            className="w-40"
          />
        </label>
        <label htmlFor="menu-ke" className="flex flex-col gap-1">
          <span className="label-cap text-ink-lemah">Sampai</span>
          <Input
            id="menu-ke"
            type="date"
            value={to}
            onChange={(event) => updateParam("ke", event.target.value)}
            className="w-40"
          />
        </label>
        <p className="pb-2 font-mono text-xs text-ink-lemah">
          {formatDateOnly(from)} — {formatDateOnly(to)}
        </p>
      </div>

      {showSkeleton ? <SkeletonList rows={6} /> : null}

      {insights.isError ? (
        <ErrorState
          description={apiError?.message ?? "Periksa jaringan lalu coba lagi."}
          requestId={apiError?.requestId}
          onRetry={() => void insights.refetch()}
        />
      ) : null}

      {insights.data === undefined || showSkeleton ? null : <InsightList report={insights.data} />}

      <ObservationSheet
        open={observationOpen}
        onOpenChange={setObservationOpen}
        sppgId={sppgId}
      />

      <MenuItemSheet open={itemOpen} onOpenChange={setItemOpen} />
    </div>
  );
}