import { isApiError } from "@/api/api-error";
import { LedgerRecentTable } from "@/features/ledger/components/ledger-recent-table";
import { useRecentLedgerEvents } from "@/features/ledger/hooks/use-recent-ledger-events";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { useDelayedLoading } from "@/shared/hooks/use-delayed-loading";
import { formatInt, formatMoment } from "@/shared/lib/format";

export function LedgerRecentPage() {
  const query = useRecentLedgerEvents();
  const showSkeleton = useDelayedLoading(query.isPending);
  const apiError = isApiError(query.error) ? query.error : null;

  const events = query.data?.items ?? [];
  const latest = events[0] ?? null;

  return (
    <div className="flex max-w-5xl flex-col gap-5">
      <PageHeader
        title="Buku besar"
        description={
          query.data === undefined
            ? "Umpan peristiwa terakhir dari seluruh dapur."
            : `${formatInt(events.length)} peristiwa terakhir${
                latest === null ? "" : ` · terbaru ${formatMoment(latest.occurredAt)}`
              }.`
        }
      />

      {showSkeleton ? <SkeletonList rows={10} rowClassName="h-10" /> : null}

      {query.isError ? (
        <ErrorState
          description={apiError?.message ?? "Periksa jaringan lalu coba lagi."}
          requestId={apiError?.requestId}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.data !== undefined && events.length === 0 ? (
        <EmptyState
          title="Belum ada peristiwa ledger."
          description="Peristiwa muncul setelah dapur mencatat batch pertamanya."
        />
      ) : null}

      {events.length > 0 ? <LedgerRecentTable events={events} /> : null}

      <p className="text-xs text-ink-lemah">
        Segel adalah potongan hash SHA-256 peristiwa — ketuk untuk menyalin dan memeriksa.
      </p>
    </div>
  );
}