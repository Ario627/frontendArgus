import { useState } from "react";
import { isApiError } from "@/api/api-error";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useBatches, type BatchFilterState } from "@/features/batch/hooks/use-batches";
import { TransferConfirmSheet } from "@/features/routes/components/transfer-confirm-sheet";
import { Button } from "@/shared/components/ui/button";
import { ChipButton } from "@/shared/components/ui/chip";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { useDelayedLoading } from "@/shared/hooks/use-delayed-loading";
import { BATCH_STATUS_LABELS } from "@/shared/constants/batch.constant";
import { cn } from "@/shared/lib/cn";
import { formatMoment, formatNumber } from "@/shared/lib/format";
import type { BatchDto } from "@/shared/types/batch.types";
import type { BatchStatus } from "@/shared/constants/batch.constant";

const STATUS_TONES: Readonly<Partial<Record<BatchStatus, string>>> = Object.freeze({
  DICATAT: "text-ink-lemah",
  MENUNGGU_ANGKUT: "text-kunyit",
  DIANGKUT: "text-biru-tinta",
  DITERIMA: "text-biru-tinta",
  DIOLAH: "text-daun",
  SELESAI: "text-daun",
  GAGAL_GATE: "text-bata",
  TERSANGKUT: "text-bata"
});

const TRANSFERABLE: readonly BatchStatus[] = Object.freeze([
  "DICATAT",
  "MENUNGGU_ANGKUT",
  "GAGAL_GATE"
] as const);

type FilterValue = "semua" | "menunggu" | "jalan" | "selesai";

const FILTERS: readonly { readonly value: FilterValue; readonly label: string }[] = Object.freeze([
  { value: "semua", label: "Semua" },
  { value: "menunggu", label: "Menunggu" },
  { value: "jalan", label: "Jalan" },
  { value: "selesai", label: "Selesai" }
]);

const FILTER_STATUSES: Readonly<Record<Exclude<FilterValue, "semua">, readonly BatchStatus[]>> =
  Object.freeze({
    menunggu: ["DICATAT", "MENUNGGU_ANGKUT", "GAGAL_GATE"],
    jalan: ["DIANGKUT", "DITERIMA", "DIOLAH"],
    selesai: ["SELESAI"]
  });

export function StaffBatchesPage() {
  const sppgId = useAuthStore((state) => state.user?.sppgId ?? null);
  const [filter, setFilter] = useState<FilterValue>("semua");
  const [transferBatch, setTransferBatch] = useState<BatchDto | null>(null);

  const baseFilters: BatchFilterState = {};
  const query = useBatches(baseFilters, sppgId);
  const showSkeleton = useDelayedLoading(query.isPending);
  const apiError = isApiError(query.error) ? query.error : null;

  const allItems = (query.data?.pages ?? []).flatMap((page) => page.items);
  const items =
    filter === "semua"
      ? allItems
      : allItems.filter((batch) => FILTER_STATUSES[filter].includes(batch.status));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Batch hari ini"
        description="Catatan limbah dapur Anda dan status penyerahannya."
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter status batch">
        {FILTERS.map((option) => (
          <ChipButton
            key={option.value}
            selected={filter === option.value}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </ChipButton>
        ))}
      </div>

      {showSkeleton ? <SkeletonList rows={5} /> : null}

      {query.isError ? (
        <ErrorState
          description={apiError?.message ?? "Periksa jaringan lalu coba lagi."}
          requestId={apiError?.requestId}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.data !== undefined && items.length === 0 ? (
        <EmptyState
          title={filter === "semua" ? "Belum ada batch hari ini." : "Tidak ada batch pada filter ini."}
          description="Batch dibuat dari layar Catat limbah. Setelah dicatat, serahkan ke pengemudi dan catat saksi penyerahan di sini."
        />
      ) : null}

      {items.length > 0 ? (
        <ul className="flex flex-col">
          {items.map((batch) => (
            <li
              key={batch.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-garis py-3 last:border-b-0"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-mono text-md tabular-nums text-ink">
                  {formatNumber(batch.weightKg, 1)} kg
                </span>
                <span className="flex flex-wrap gap-x-3 text-xs text-ink-lemah">
                  <span className="font-mono">{batch.id.slice(0, 8)}</span>
                  <span>{formatMoment(batch.dikeluarkanAt)}</span>
                  <span className={cn("font-medium", STATUS_TONES[batch.status])}>
                    {BATCH_STATUS_LABELS[batch.status]}
                  </span>
                </span>
              </div>
              {TRANSFERABLE.includes(batch.status) ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setTransferBatch(batch)}
                >
                  Serah ke driver
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {query.hasNextPage ? (
        <Button
          variant="secondary"
          fullWidth
          loading={query.isFetchingNextPage}
          onClick={() => void query.fetchNextPage()}
        >
          Muat lagi
        </Button>
      ) : null}

      <p className="text-xs text-ink-lemah">
        Batch baru langsung masuk antrean penugasan dan otomatis ditugaskan bila ada armada
        berkapasitas. Pengemudi menandai muatan terangkut, lalu Anda mencatat serah terima;
        penerima melengkapi dari sisinya agar status menjadi sah.
      </p>

      <TransferConfirmSheet
        batchId={transferBatch?.id ?? null}
        onOpenChange={(open) => {
          if (!open) setTransferBatch(null);
        }}
        position={null}
        roleNote="Anda mencatat sebagai saksi pengirim dari sisi dapur."
      />
    </div>
  );
}
