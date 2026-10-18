import { useState } from "react";
import { isApiError } from "@/api/api-error";
import { useChainVerify, useHealth, useRetentionRun } from "@/features/diagnostics/hooks/use-ops";
import { Button } from "@/shared/components/ui/button";
import { Chip } from "@/shared/components/ui/chip";
import { ConfirmDialog } from "@/shared/components/ui/dialog";
import { PageHeader } from "@/shared/components/layout/page-header";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { cn } from "@/shared/lib/cn";
import { Link } from "react-router";
import { formatDateTime, formatDuration, formatInt } from "@/shared/lib/format";
import type { ProbeState } from "@/shared/types/ops.types";

const PROBE_LABELS: Readonly<Record<ProbeState, string>> = Object.freeze({
  ok: "normal",
  down: "gangguan",
  unknown: "belum diketahui"
});

function ProbeRow({ label, state }: { readonly label: string; readonly state: ProbeState }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-garis py-2 last:border-b-0">
      <span className="text-sm text-ink-lemah">{label}</span>
      <span
        className={cn(
          "font-mono text-xs",
          state === "ok" ? "text-daun" : state === "down" ? "text-bata" : "text-ink-lemah"
        )}
      >
        {PROBE_LABELS[state]}
      </span>
    </div>
  );
}

export function DiagnosticsPage() {
  const health = useHealth();
  const chain = useChainVerify();
  const retention = useRetentionRun();
  const showToast = useToastStore((state) => state.show);
  const [retentionOpen, setRetentionOpen] = useState(false);

  const runChain = () => {
    chain.mutate(undefined, {
      onSuccess: (report) => {
        showToast({
          message: report.skipped
            ? "Pemeriksaan rantai dilewati (nonaktif di konfigurasi)."
            : `Rantai diperiksa: ${formatInt(report.checked)} batch, ${formatInt(report.failed)} gagal.`,
          tone: report.failed > 0 ? "bata" : "netral"
        });
      },
      onError: (cause) => {
        showToast({
          message: isApiError(cause) ? cause.message : "Pemeriksaan rantai tidak dapat dijalankan.",
          tone: "bata"
        });
      }
    });
  };

  const runRetention = () => {
    setRetentionOpen(false);
    retention.mutate(undefined, {
      onSuccess: (report) => {
        showToast({
          message: report.skipped
            ? "Retensi dilewati (purge nonaktif)."
            : `Retensi selesai: ${formatInt(report.telemetryChunksDropped)} chunk telemetri, ${formatInt(report.photosDeleted)} foto dihapus.`,
          tone: report.failures > 0 ? "bata" : "netral"
        });
      },
      onError: (cause) => {
        showToast({
          message: isApiError(cause) ? cause.message : "Retensi tidak dapat dijalankan.",
          tone: "bata"
        });
      }
    });
  };

  const chainReport = chain.data ?? null;
  const retentionReport = retention.data ?? null;

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <PageHeader
        title="Diagnostik"
        description="Kesehatan sistem, verifikasi rantai hash, dan retensi data. Tindakan di sini meninggalkan jejak audit."
      />

      <section className="flex flex-col gap-3 rounded-kontainer border border-garis p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-ink">Kesehatan sistem</h2>
          {health.data === undefined ? null : (
            <Chip
              className={cn(
                "h-7",
                health.data.status === "ok" ? "border-daun/50 text-daun" : "border-kunyit/60 text-kunyit"
              )}
            >
              {health.data.status === "ok" ? "normal" : "degradasi"}
            </Chip>
          )}
        </div>
        {health.isPending ? <SkeletonList rows={3} /> : null}
        {health.isError ? (
          <p className="text-sm text-bata">Health check tidak dapat dihubungi.</p>
        ) : null}
        {health.data === undefined ? null : (
          <div>
            <ProbeRow label="Basis data" state={health.data.db ? "ok" : "down"} />
            <ProbeRow label="MQTT broker" state={health.data.mqtt} />
            <ProbeRow label="Optimizer rute" state={health.data.optimizer} />
            <div className="flex items-center justify-between gap-3 py-2">
              <span className="text-sm text-ink-lemah">Uptime</span>
              <span className="font-mono text-xs text-ink">
                {formatDuration(health.data.uptimeSeconds * 1000)}
              </span>
            </div>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-kontainer border border-garis p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col">
            <h2 className="text-sm font-medium text-ink">Verifikasi rantai hash</h2>
            <p className="text-xs text-ink-lemah">
              Memeriksa sampel rantai buku besar lintas batch dan mencatat pelanggaran yang
              ditemukan.
            </p>
          </div>
          <Button size="sm" loading={chain.isPending} onClick={runChain}>
            Jalankan
          </Button>
        </div>

        {chainReport === null ? null : (
          <div className="flex flex-col gap-2 border-t border-garis pt-3">
            <p className="font-mono text-2xs text-ink-lemah">
              {formatDateTime(chainReport.checkedAt)}
            </p>
            {chainReport.skipped ? (
              <p className="text-sm text-ink-lemah">Pemeriksaan dilewati oleh konfigurasi.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <span className="text-xs text-ink-lemah">Diperiksa</span>
                  <span className="font-mono text-md tabular-nums text-ink">
                    {formatInt(chainReport.checked)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-ink-lemah">Gagal</span>
                  <span
                    className={cn(
                      "font-mono text-md tabular-nums",
                      chainReport.failed > 0 ? "text-bata" : "text-ink"
                    )}
                  >
                    {formatInt(chainReport.failed)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-ink-lemah">Error</span>
                  <span className="font-mono text-md tabular-nums text-ink">
                    {formatInt(chainReport.errors)}
                  </span>
                </div>
              </div>
            )}
            {chainReport.breachBatchIds.length > 0 ? (
              <div className="flex flex-col gap-1">
                <p className="text-xs text-bata">Batch bermasalah:</p>
                <ul className="flex flex-wrap gap-2">
                  {chainReport.breachBatchIds.map((batchId) => (
                    <li key={batchId}>
                      <Link
                        to={`/batches/${batchId}`}
                        className="font-mono text-xs text-biru-tinta underline-offset-2 hover:underline"
                      >
                        {batchId.slice(0, 8)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-kontainer border border-garis p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col">
            <h2 className="text-sm font-medium text-ink">Retensi data</h2>
            <p className="text-xs text-ink-lemah">
              Menjatuhkan chunk telemetri lama dan menghapus foto kedaluwarsa. Data buku besar tidak
              pernah dihapus.
            </p>
          </div>
          <Button size="sm" variant="secondary" loading={retention.isPending} onClick={() => setRetentionOpen(true)}>
            Jalankan
          </Button>
        </div>

        {retentionReport === null ? null : (
          <div className="flex flex-col gap-2 border-t border-garis pt-3">
            <p className="font-mono text-2xs text-ink-lemah">
              {formatDateTime(retentionReport.ranAt)}
            </p>
            {retentionReport.skipped ? (
              <p className="text-sm text-ink-lemah">Retensi dilewati: purge nonaktif.</p>
            ) : (
              <dl className="flex flex-col">
                <div className="flex items-center justify-between gap-3 border-b border-garis py-1.5 text-sm">
                  <dt className="text-ink-lemah">Chunk telemetri dibuang</dt>
                  <dd className="font-mono tabular-nums text-ink">
                    {formatInt(retentionReport.telemetryChunksDropped)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-garis py-1.5 text-sm">
                  <dt className="text-ink-lemah">Foto kandidat</dt>
                  <dd className="font-mono tabular-nums text-ink">
                    {formatInt(retentionReport.photoCandidates)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-garis py-1.5 text-sm">
                  <dt className="text-ink-lemah">Foto dihapus</dt>
                  <dd className="font-mono tabular-nums text-ink">
                    {formatInt(retentionReport.photosDeleted)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
                  <dt className="text-ink-lemah">Kegagalan</dt>
                  <dd
                    className={cn(
                      "font-mono tabular-nums",
                      retentionReport.failures > 0 ? "text-bata" : "text-ink"
                    )}
                  >
                    {formatInt(retentionReport.failures)}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={retentionOpen}
        onOpenChange={setRetentionOpen}
        title="Jalankan retensi sekarang?"
        description="Operasi ini menghapus foto dan telemetri yang melewati batas retensi. Data buku besar, batch, dan audit tidak ikut dihapus."
        confirmLabel="Jalankan retensi"
        tone="bahaya"
        pending={retention.isPending}
        onConfirm={runRetention}
      />
    </div>
  );
}
