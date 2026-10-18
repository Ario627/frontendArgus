import { useState } from "react";
import { IncomingBatchRow } from "@/features/facility/components/incoming-batch-row";
import { useIncomingBatches } from "@/features/facility/hooks/use-incoming-batches";
import { AppendEventSheet } from "@/features/ledger/components/append-event-sheet";
import type { UiAppendType } from "@/features/ledger/ledger-append";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { formatInt } from "@/shared/lib/format";
import type { DispositionQueueItem } from "@/shared/types/disposition.types";

export function IncomingPage() {
  const role = useAuthStore((state) => state.role);
  const incoming = useIncomingBatches();
  const [selected, setSelected] = useState<{ item: DispositionQueueItem; tipe: UiAppendType } | null>(null);

  const waiting = incoming.items.filter((item) => item.status === "DIANGKUT");
  const processing = incoming.items.filter((item) => item.status !== "DIANGKUT");

  const handleAct = (item: DispositionQueueItem, tipe: UiAppendType) => {
    setSelected({ item, tipe });
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Fasilitas masuk"
        description={
          incoming.isPending ? "Memuat batch yang menuju fasilitas ini." : `${formatInt(incoming.items.length)} batch perlu ditangani.`
        }
      />

      {incoming.isPending ? <SkeletonList rows={4} /> : null}

      {incoming.isError ? (
        <ErrorState
          description={incoming.error?.message ?? "Periksa jaringan lalu coba lagi."}
          requestId={incoming.error?.requestId}
          onRetry={incoming.refetch}
        />
      ) : null}

      {!incoming.isPending && !incoming.isError && incoming.items.length === 0 ? (
        <EmptyState
          title="Tidak ada batch menuju fasilitas ini."
          description="Batch muncul di sini setelah dapur memutuskan limpahan ke fasilitas Anda."
        />
      ) : null}

      {waiting.length > 0 ? (
        <section className="flex flex-col">
          <h2 className="text-sm font-medium text-ink">
            Menunggu diterima
            <span className="ml-2 font-mono text-xs text-ink-lemah">{waiting.length}</span>
          </h2>
          {waiting.map((item) => (
            <IncomingBatchRow key={item.batchId} item={item} onAct={handleAct} />
          ))}
        </section>
      ) : null}

      {processing.length > 0 ? (
        <section className="flex flex-col">
          <h2 className="text-sm font-medium text-ink">
            Sedang diproses
            <span className="ml-2 font-mono text-xs text-ink-lemah">{processing.length}</span>
          </h2>
          {processing.map((item) => (
            <IncomingBatchRow key={item.batchId} item={item} onAct={handleAct} />
          ))}
        </section>
      ) : null}

      <AppendEventSheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        batchId={selected?.item.batchId ?? ""}
        batchWeightKg={selected?.item.weightKg ?? 0}
        status={selected?.item.status ?? "DICATAT"}
        role={role}
        defaultType={selected?.tipe}
      />
    </div>
  );
}