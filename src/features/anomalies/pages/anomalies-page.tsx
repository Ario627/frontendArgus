import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { isApiError } from "@/api/api-error";
import { AnomalyDetailSheet } from "@/features/anomalies/components/anomaly-detail-sheet";
import { AnomalyTable } from "@/features/anomalies/components/anomaly-table";
import { useAnomalies, type AnomalyFilterState } from "@/features/anomalies/hooks/use-anomalies";
import { Button } from "@/shared/components/ui/button";
import { Select } from "@/shared/components/ui/select";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import {
  ANOMALY_KINDS,
  ANOMALY_KIND_LABELS,
  ANOMALY_SEVERITIES,
  ANOMALY_SEVERITY_LABELS,
  type AnomalyKind,
  type AnomalySeverity
} from "@/shared/constants/anomaly.constant";
import { useDelayedLoading } from "@/shared/hooks/use-delayed-loading";
import { formatInt } from "@/shared/lib/format";
import type { AnomalyDto } from "@/shared/types/anomaly.types";

function readFilters(params: URLSearchParams): AnomalyFilterState {
  const jenis = params.get("jenis") ?? "";
  const tingkat = params.get("tingkat") ?? "";
  return {
    terbuka: params.get("terbuka") !== "false",
    ...(ANOMALY_KINDS.includes(jenis as AnomalyKind) ? { jenis: jenis as AnomalyKind } : {}),
    ...(ANOMALY_SEVERITIES.includes(tingkat as AnomalySeverity)
      ? { tingkat: tingkat as AnomalySeverity }
      : {})
  };
}

export function AnomaliesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const query = useAnomalies(filters);
  const showSkeleton = useDelayedLoading(query.isPending);
  const apiError = isApiError(query.error) ? query.error : null;

  const [selected, setSelected] = useState<AnomalyDto | null>(null);

  const anomalies = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  const hasFilters =
    filters.jenis !== undefined || filters.tingkat !== undefined || !filters.terbuka;

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "") next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  return (
    <div className="flex max-w-5xl flex-col gap-5">
      <PageHeader
        title="Anomali"
        description={
          query.data === undefined
            ? "Temuan verifikasi rantai dan neraca massa."
            : `${formatInt(total)} anomali ${filters.terbuka ? "terbuka" : "tercatat"}.`
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="label-cap text-ink-lemah">Jenis</span>
          <Select
            value={filters.jenis ?? ""}
            onChange={(event) => updateParam("jenis", event.target.value)}
            className="w-48"
          >
            <option value="">Semua</option>
            {ANOMALY_KINDS.map((jenis) => (
              <option key={jenis} value={jenis}>
                {ANOMALY_KIND_LABELS[jenis]}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="label-cap text-ink-lemah">Tingkat</span>
          <Select
            value={filters.tingkat ?? ""}
            onChange={(event) => updateParam("tingkat", event.target.value)}
            className="w-40"
          >
            <option value="">Semua</option>
            {ANOMALY_SEVERITIES.map((tingkat) => (
              <option key={tingkat} value={tingkat}>
                {ANOMALY_SEVERITY_LABELS[tingkat]}
              </option>
            ))}
          </Select>
        </label>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => updateParam("terbuka", filters.terbuka ? "false" : "")}
        >
          {filters.terbuka ? "Tampilkan yang tertutup juga" : "Hanya yang terbuka"}
        </Button>
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

      {query.data !== undefined && anomalies.length === 0 ? (
        <EmptyState
          title={filters.terbuka ? "Tidak ada anomali terbuka." : "Tidak ada anomali tercatat."}
          description={
            filters.terbuka
              ? "Verifikasi rantai dan neraca massa jalan saat halaman batch dibuka atau saat verifikasi harian berjalan."
              : undefined
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

      {anomalies.length > 0 ? <AnomalyTable anomalies={anomalies} onOpen={setSelected} /> : null}

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

      <AnomalyDetailSheet
        anomaly={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
