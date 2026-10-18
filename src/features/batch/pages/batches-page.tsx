import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { BatchFilterBar } from "@/features/batch/components/batch-filter-bar";
import { BatchTable } from "@/features/batch/components/batch-table";
import {
  readBatchFilters,
  useBatches,
  writeBatchFilters,
  type BatchFilterState
} from "@/features/batch/hooks/use-batches";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Button, ButtonLink } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { useDelayedLoading } from "@/shared/hooks/use-delayed-loading";
import { isApiError } from "@/api/api-error";
import { formatInt } from "@/shared/lib/format";

export function BatchesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const role = useAuthStore((state) => state.role);
  const sppgId = useAuthStore((state) => state.user?.sppgId ?? null);

  const filters: BatchFilterState = useMemo(() => readBatchFilters(searchParams), [searchParams]);
  const scopeSppgId = role === "sppg_staff" ? sppgId : null;
  const query = useBatches(filters, scopeSppgId);
  const apiError = isApiError(query.error) ? query.error : null;

  const batches = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  const showSkeleton = useDelayedLoading(query.isPending);
  const hasFilters =
    filters.status !== undefined || filters.tier !== undefined || filters.aliran !== undefined;

  const handleFilters = (next: BatchFilterState) => {
    setSearchParams(writeBatchFilters(next));
  };

  return (
    <div className="flex max-w-5xl flex-col gap-5">
      <PageHeader
        title="Batch"
        description={
          query.data === undefined ? "Riwayat catatan limbah." : `${formatInt(total)} catatan tercatat.`
        }
        actions={
          role === "sppg_staff" ? (
            <ButtonLink to="/catat" variant="primary" size="sm">
              Catat batch
            </ButtonLink>
          ) : null
        }
      />

      <BatchFilterBar filters={filters} onChange={handleFilters} />

      {showSkeleton ? <SkeletonList rows={8} /> : null}

      {query.isError ? (
        <ErrorState
          description={apiError?.message ?? "Periksa jaringan lalu coba lagi."}
          requestId={apiError?.requestId}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.data !== undefined && batches.length === 0 ? (
        hasFilters ? (
          <EmptyState
            title="Tidak ada batch dengan filter ini."
            action={
              <Button variant="secondary" size="sm" onClick={() => handleFilters({})}>
                Hapus filter
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="Belum ada batch hari ini."
            description={
              role === "sppg_staff"
                ? "Mulai dari sisa persiapan atau sisa piring."
                : "Catatan akan muncul setelah dapur mulai menimbang."
            }
            action={
              role === "sppg_staff" ? (
                <ButtonLink to="/catat" variant="primary" size="sm">
                  Catat batch
                </ButtonLink>
              ) : undefined
            }
          />
        )
      ) : null}

      {batches.length > 0 ? <BatchTable batches={batches} /> : null}

      {query.hasNextPage ? (
        <div>
          <Button
            variant="secondary"
            loading={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            Muat lagi
          </Button>
        </div>
      ) : null}
    </div>
  );
}