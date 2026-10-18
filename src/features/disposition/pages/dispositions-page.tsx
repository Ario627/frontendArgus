import { useState } from "react";
import { useSearchParams } from "react-router";
import { isApiError } from "@/api/api-error";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { CandidateScoreSheet } from "@/features/disposition/components/candidate-score-sheet";
import { DispositionTable } from "@/features/disposition/components/disposition-table";
import { RunDispositionSheet } from "@/features/disposition/components/run-disposition-sheet";
import { useDispositionQueue } from "@/features/disposition/hooks/use-disposition-queue";
import { useSppgList } from "@/features/sppg/hooks/use-sppg-list";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { useDelayedLoading } from "@/shared/hooks/use-delayed-loading";
import { formatDateOnly, formatInt, wibIsoDate } from "@/shared/lib/format";
import type { DispositionQueueItem } from "@/shared/types/disposition.types";

export function DispositionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const role = useAuthStore((state) => state.role);
  const canRun = role === "admin" || role === "dlh_auditor";

  const date = searchParams.get("date") ?? wibIsoDate(0);
  const sppgFilter = canRun ? searchParams.get("sppgId") : null;
  const sppgQuery = useSppgList(true);
  const queue = useDispositionQueue(date, sppgFilter);
  const showSkeleton = useDelayedLoading(queue.isPending);

  const [selected, setSelected] = useState<DispositionQueueItem | null>(null);
  const [runOpen, setRunOpen] = useState(false);

  const items = queue.data ?? [];
  const apiError = isApiError(queue.error) ? queue.error : null;
  const decided = items.filter((item) => item.tier !== null).length;

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "") next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  return (
    <div className="flex max-w-5xl flex-col gap-5">
      <PageHeader
        title="Antrean putusan"
        description={`${formatDateOnly(date)} · ${formatInt(decided)} dari ${formatInt(items.length)} sudah diputus.`}
        actions={
          <>
            <Input
              type="date"
              aria-label="Tanggal"
              value={date}
              onChange={(event) => updateParam("date", event.target.value)}
              className="w-40"
            />
            {canRun ? (
              <Select
                aria-label="Filter dapur"
                value={sppgFilter ?? ""}
                onChange={(event) => updateParam("sppgId", event.target.value)}
                className="w-48"
              >
                <option value="">Semua dapur</option>
                {(sppgQuery.data?.items ?? []).map((sppg) => (
                  <option key={sppg.id} value={sppg.id}>
                    {sppg.nama}
                  </option>
                ))}
              </Select>
            ) : null}
            {canRun ? (
              <Button variant="secondary" size="sm" onClick={() => setRunOpen(true)}>
                Jalankan disposisi
              </Button>
            ) : null}
          </>
        }
      />

      {showSkeleton ? <SkeletonList rows={8} /> : null}

      {queue.isError ? (
        <ErrorState
          description={apiError?.message ?? "Periksa jaringan lalu coba lagi."}
          requestId={apiError?.requestId}
          onRetry={() => void queue.refetch()}
        />
      ) : null}

      {queue.data !== undefined && items.length === 0 ? (
        <EmptyState
          title="Tidak ada batch pada tanggal ini."
          description="Batch muncul di antrean setelah dapur mencatat timbangan."
        />
      ) : null}

      {items.length > 0 ? <DispositionTable items={items} onOpen={setSelected} /> : null}

      <CandidateScoreSheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        item={selected}
      />

      <RunDispositionSheet open={runOpen} onOpenChange={setRunOpen} defaultDate={date} />
    </div>
  );
}