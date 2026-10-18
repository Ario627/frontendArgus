import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { isApiError } from "@/api/api-error";
import { TicketTable } from "@/features/tickets/components/ticket-table";
import { useTickets, type TicketFilterState } from "@/features/tickets/hooks/use-tickets";
import { TICKET_KINDS, TICKET_KIND_LABELS, TICKET_STATUSES, TICKET_STATUS_LABELS } from "@/shared/constants/ticket.constant";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Select } from "@/shared/components/ui/select";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { useDelayedLoading } from "@/shared/hooks/use-delayed-loading";
import { formatInt } from "@/shared/lib/format";
import type { TicketKind, TicketStatus } from "@/shared/constants/ticket.constant";

function readFilters(params: URLSearchParams): TicketFilterState {
  const status = params.get("status") ?? "";
  const jenis = params.get("jenis") ?? "";
  return {
    ...(TICKET_STATUSES.includes(status as TicketStatus) ? { status: status as TicketStatus } : {}),
    ...(TICKET_KINDS.includes(jenis as TicketKind) ? { jenis: jenis as TicketKind } : {})
  };
}

export function TicketsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const query = useTickets(filters);
  const showSkeleton = useDelayedLoading(query.isPending);
  const apiError = isApiError(query.error) ? query.error : null;

  const tickets = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  const hasFilters = filters.status !== undefined || filters.jenis !== undefined;

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "") next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  return (
    <div className="flex max-w-5xl flex-col gap-5">
      <PageHeader
        title="Tiket warga"
        description={
          query.data === undefined ? "Laporan warga sekitar dapur." : `${formatInt(total)} laporan tercatat.`
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="label-cap text-ink-lemah">Status</span>
          <Select
            value={filters.status ?? ""}
            onChange={(event) => updateFilter("status", event.target.value)}
            className="w-44"
          >
            <option value="">Semua</option>
            {TICKET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {TICKET_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="label-cap text-ink-lemah">Jenis</span>
          <Select
            value={filters.jenis ?? ""}
            onChange={(event) => updateFilter("jenis", event.target.value)}
            className="w-40"
          >
            <option value="">Semua</option>
            {TICKET_KINDS.map((jenis) => (
              <option key={jenis} value={jenis}>
                {TICKET_KIND_LABELS[jenis]}
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

      {showSkeleton ? <SkeletonList rows={8} /> : null}

      {query.isError ? (
        <ErrorState
          description={apiError?.message ?? "Periksa jaringan lalu coba lagi."}
          requestId={apiError?.requestId}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.data !== undefined && tickets.length === 0 ? (
        hasFilters ? (
          <EmptyState
            title="Tidak ada laporan dengan filter ini."
            action={
              <Button variant="secondary" size="sm" onClick={() => setSearchParams(new URLSearchParams())}>
                Hapus filter
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="Belum ada laporan warga."
            description="Laporan masuk lewat halaman publik yang dipindai warga di pagar dapur."
          />
        )
      ) : null}

      {tickets.length > 0 ? <TicketTable tickets={tickets} /> : null}

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