import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { isApiError } from "@/api/api-error";
import { AuditTable } from "@/features/audit/components/audit-table";
import { useAuditLogs, type AuditFilterState } from "@/features/audit/hooks/use-audit-logs";
import { Button } from "@/shared/components/ui/button";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { useDelayedLoading } from "@/shared/hooks/use-delayed-loading";
import { formatDateOnly, formatInt } from "@/shared/lib/format";

function readFilters(params: URLSearchParams): AuditFilterState {
  const aksi = params.get("aksi") ?? "";
  const from = params.get("dari") ?? "";
  const to = params.get("ke") ?? "";
  return {
    ...(aksi === "" ? {} : { aksi }),
    ...(from === "" ? {} : { from }),
    ...(to === "" ? {} : { to })
  };
}

export function AuditPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const query = useAuditLogs(filters);
  const showSkeleton = useDelayedLoading(query.isPending);
  const apiError = isApiError(query.error) ? query.error : null;

  const logs = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  const hasFilters = filters.aksi !== undefined || filters.from !== undefined || filters.to !== undefined;

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "") next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  return (
    <div className="flex max-w-5xl flex-col gap-5">
      <PageHeader
        title="Jejak audit"
        description={
          query.data === undefined
            ? "Semua mutasi admin dan auditor tercatat di sini."
            : `${formatInt(total)} aktivitas${
                filters.from === undefined ? "" : ` sejak ${formatDateOnly(filters.from)}`
              }.`
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <Field label="Aksi berisi" className="w-56">
          {(control) => (
            <Input
              id={control.id}
              aria-describedby={control.describedBy}
              autoComplete="off"
              placeholder="Contoh: revoke"
              value={filters.aksi ?? ""}
              onChange={(event) => updateParam("aksi", event.target.value)}
            />
          )}
        </Field>
        <Field label="Dari tanggal" className="w-40">
          {(control) => (
            <Input
              id={control.id}
              aria-describedby={control.describedBy}
              type="date"
              value={filters.from ?? ""}
              onChange={(event) => updateParam("dari", event.target.value)}
            />
          )}
        </Field>
        <Field label="Sampai tanggal" className="w-40">
          {(control) => (
            <Input
              id={control.id}
              aria-describedby={control.describedBy}
              type="date"
              value={filters.to ?? ""}
              onChange={(event) => updateParam("ke", event.target.value)}
            />
          )}
        </Field>
        {hasFilters ? (
          <Button variant="ghost" size="sm" onClick={() => setSearchParams(new URLSearchParams())}>
            Hapus filter
          </Button>
        ) : null}
      </div>

      {showSkeleton ? <SkeletonList rows={10} rowClassName="h-12" /> : null}

      {query.isError ? (
        <ErrorState
          description={apiError?.message ?? "Periksa jaringan lalu coba lagi."}
          requestId={apiError?.requestId}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.data !== undefined && logs.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Tidak ada aktivitas dengan filter ini." : "Belum ada aktivitas tercatat."}
          description={
            hasFilters ? undefined : "Mutasi admin dan auditor akan muncul di sini secara otomatis."
          }
          action={
            hasFilters ? (
              <Button variant="secondary" size="sm" onClick={() => setSearchParams(new URLSearchParams())}>
                Hapus filter
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {logs.length > 0 ? <AuditTable logs={logs} /> : null}

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

      <p className="text-xs text-ink-lemah">
        Jejak audit bersifat hanya-tambah: baris tidak bisa diubah atau dihapus, termasuk oleh admin.
      </p>
    </div>
  );
}
