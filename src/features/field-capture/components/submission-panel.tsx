import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { isApiError } from "@/api/api-error";
import { qk } from "@/api/query-keys";
import { fetchBatchDetail } from "@/features//field-capture/api/capture.api";
import { GateVerdictPanel } from "@/features/field-capture/components/gate-verdict-panel";
import { useRegateBatch } from "@/features/field-capture/hooks/use-regate-batch";
import { describeOutboxError } from "@/features/outbox/outbox.presenter";
import { useOutbox } from "@/features/outbox/hooks/use-outbox";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ui/dialog";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { useOnline } from "@/shared/hooks/use-online";
import type { ReGateInput } from "@/shared/types/batch.types";

export interface SubmissionPanelProps {
  readonly clientEventId: string;
  readonly onNew: () => void;
}

export function SubmissionPanel({ clientEventId, onNew }: SubmissionPanelProps) {
  const outbox = useOutbox();
  const online = useOnline();
  const regate = useRegateBatch();
  const [dropOpen, setDropOpen] = useState(false);
  const [regateError, setRegateError] = useState<string | null>(null);

  const item = useMemo(
    () => outbox.items.find((entry) => entry.id === clientEventId) ?? null,
    [outbox.items, clientEventId]
  );

  const detailQuery = useQuery({
    queryKey: qk.batches.detail(item?.resourceId ?? "belum-terkirim"),
    queryFn: () => fetchBatchDetail(item?.resourceId ?? ""),
    enabled: item !== null && item.status === "terkirim" && item.resourceId !== undefined,
    staleTime: 0
  });

  const position = outbox.positionOf(clientEventId);

  const handleRegate = (patch: ReGateInput) => {
    const batchId = item?.resourceId;
    if (batchId === undefined) return;
    setRegateError(null);
    regate.mutate(
      { batchId, patch },
      {
        onSuccess: () => {
          void detailQuery.refetch();
        },
        onError: (error) => {
          setRegateError(
            isApiError(error) ? error.message : "Tidak dapat menilai ulang saat ini. Coba lagi."
          );
        }
      }
    );
  };

  if (item === null) {
    return <SkeletonList rows={3} />;
  }

  if (item.status === "menunggu") {
    const syncing = outbox.syncState === "syncing";
    const label = position === null ? "" : ` (posisi ${position})`;
    return (
      <div aria-live="polite" className="flex flex-col gap-3">
        <p className="text-base font-medium text-ink">Tersimpan di perangkat{label}</p>
        <p className="text-sm text-ink-lemah">
          {!online
            ? "Offline — catatan aman dan akan dikirim saat jaringan kembali."
            : syncing
              ? "Mengirim ke server…"
              : "Menunggu sinkron. Anda bisa lanjut mencatat yang lain."}
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={!online || syncing}
            loading={syncing}
            onClick={() => void outbox.syncNow()}
          >
            Sinkron sekarang
          </Button>
          <Button variant="ghost" onClick={onNew}>
            Catat batch lagi
          </Button>
        </div>
      </div>
    );
  }

  if (item.status === "ditolak") {
    return (
      <div aria-live="polite" className="flex flex-col gap-3">
        <p className="text-base font-medium text-bata">Catatan ditolak server</p>
        <ul className="flex flex-col gap-0.5">
          {item.errors?.map((error) => (
            <li key={`${error.code}-${error.field ?? ""}`} className="text-sm text-bata">
              {describeOutboxError(error)}
            </li>
          ))}
        </ul>
        <p className="text-sm text-ink-lemah">Perbaiki lalu catat ulang, atau buang catatan ini dari antrean.</p>
        <div className="flex gap-2">
          <Button variant="danger" onClick={() => setDropOpen(true)}>
            Buang catatan
          </Button>
          <Button variant="ghost" onClick={onNew}>
            Catat batch baru
          </Button>
        </div>
        <ConfirmDialog
          open={dropOpen}
          onOpenChange={setDropOpen}
          title="Buang catatan ini?"
          description="Catatan dihapus dari perangkat dan tidak akan terkirim. Tindakan ini tidak bisa dibatalkan."
          confirmLabel="Buang catatan"
          tone="bahaya"
          typedWord="BUANG"
          onConfirm={() => {
            setDropOpen(false);
            void outbox.dropItem(clientEventId).then(onNew);
          }}
        />
      </div>
    );
  }

  if (detailQuery.isPending) return <SkeletonList rows={4} />;

  if (detailQuery.isError || detailQuery.data === undefined) {
    const error = isApiError(detailQuery.error) ? detailQuery.error : null;
    return (
      <ErrorState
        title="Batch tersimpan, tapi rinciannya belum bisa dimuat"
        description={error?.message ?? "Periksa jaringan lalu coba lagi."}
        requestId={error?.requestId}
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  return (
    <div aria-live="polite" className="flex flex-col gap-3">
      {regateError === null ? null : (
        <p role="alert" className="rounded-kontainer border border-bata/40 bg-bata/5 px-3 py-2 text-sm text-bata">
          {regateError}
        </p>
      )}
      <GateVerdictPanel
        batch={detailQuery.data}
        duplicate={item.resultStatus === "DUPLIKAT"}
        regatePending={regate.isPending}
        onRegate={handleRegate}
        onNew={onNew}
      />
    </div>
  );
}