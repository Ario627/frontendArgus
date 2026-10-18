import { OutboxItemRow } from "@/features/outbox/components/outbox-item-row";
import { useOutbox } from "@/features/outbox/hooks/use-outbox";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { useOnline } from "@/shared/hooks/use-online";
import { formatTime } from "@/shared/lib/format";

export function OutboxPage() {
  const outbox = useOutbox();
  const online = useOnline();
  const syncing = outbox.syncState === "syncing";

  const handleSync = () => {
    void outbox.syncNow();
  };

  const handleRetry = (id: string) => {
    void outbox.retryItem(id);
  };

  const handleDrop = (id: string) => {
    void outbox.dropItem(id);
  };

  const lastSyncLabel =
    outbox.lastSyncAt === null
      ? "Belum pernah tersinkron"
      : `Tersinkron terakhir ${formatTime(new Date(outbox.lastSyncAt))}`;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Antrean"
        description="Catatan tersimpan di perangkat sampai berhasil dikirim ke server."
        actions={
          <Button
            variant="secondary"
            size="sm"
            loading={syncing}
            disabled={!online || syncing}
            onClick={handleSync}
          >
            Sinkron sekarang
          </Button>
        }
      />
      <p className="text-xs text-ink-lemah">{lastSyncLabel}</p>

      {!outbox.hydrated ? <SkeletonList rows={3} /> : null}

      {outbox.hydrated && outbox.items.length === 0 ? (
        <EmptyState
          title="Semua catatan sudah terkirim."
          description={online ? "Tidak ada yang menunggu." : "Akan tersinkron saat jaringan kembali."}
        />
      ) : null}

      {outbox.hydrated && outbox.rejected.length > 0 ? (
        <section className="flex flex-col">
          <h2 className="text-sm font-medium text-bata">
            Perlu koreksi
            <span className="ml-2 font-mono text-xs">{outbox.rejected.length}</span>
          </h2>
          {outbox.rejected.map((item) => (
            <OutboxItemRow
              key={item.id}
              item={item}
              position={null}
              syncing={syncing}
              onRetry={handleRetry}
              onDrop={handleDrop}
            />
          ))}
        </section>
      ) : null}

      {outbox.hydrated && outbox.pending.length > 0 ? (
        <section className="flex flex-col">
          <h2 className="text-sm font-medium text-ink">
            Menunggu
            <span className="ml-2 font-mono text-xs text-ink-lemah">{outbox.pending.length}</span>
          </h2>
          {outbox.pending.map((item, index) => (
            <OutboxItemRow
              key={item.id}
              item={item}
              position={index + 1}
              syncing={syncing}
              onRetry={handleRetry}
              onDrop={handleDrop}
            />
          ))}
        </section>
      ) : null}

      {outbox.hydrated && outbox.delivered.length > 0 ? (
        <section className="flex flex-col">
          <h2 className="text-sm font-medium text-ink-lemah">
            Terkirim
            <span className="ml-2 font-mono text-xs">{outbox.delivered.length}</span>
          </h2>
          {outbox.delivered.map((item) => (
            <OutboxItemRow
              key={item.id}
              item={item}
              position={null}
              syncing={syncing}
              onRetry={handleRetry}
              onDrop={handleDrop}
            />
          ))}
        </section>
      ) : null}
    </div>
  );
}