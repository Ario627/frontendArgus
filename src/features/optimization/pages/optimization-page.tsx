import { RouteIcon, PlayIcon, ClockIcon } from "lucide-react";
import { useTriggerOptimization } from "../hooks/use-trigger-optimization";
import { RouteResultTable } from "../components/route-result-table";
import { RouteResultMap } from "../components/route-result-map";
import { SkippedDestinationsList } from "../components/skipped-destinations-list";
import { Button } from "../../../shared/components/ui/button";
import { Skeleton } from "../../../shared/components/ui/skeleton";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import type { OptimizationOutput } from "../../../shared/types/optimization.types";

function formatDurationMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}dtk`;
}

function StatusBadge({ status }: { status: OptimizationOutput["status"] }) {
  const config = {
    OK: { className: "bg-status-normal/10 text-status-normal", label: "Optimal" },
    FEASIBLE: { className: "bg-status-stale/10 text-status-stale", label: "Sub-optimal" },
    NO_SOLUTION: { className: "bg-status-offline/10 text-status-offline", label: "Tidak ada solusi" },
  } as const;
  const cfg = config[status];
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

interface ResultPanelProps {
  result: OptimizationOutput;
}

function ResultPanel({ result }: ResultPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
        <StatusBadge status={result.status} />
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <ClockIcon className="h-4 w-4" />
          Solver: {formatDurationMs(result.solverDurationMs)}
        </span>
        <span className="text-sm text-muted-foreground">
          {result.routes.length} rute · {result.skipped.length} destinasi dilewati
        </span>
      </div>

      <section aria-label="Tabel rute hasil optimasi">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Rute Hasil Optimasi</h2>
        <RouteResultTable routes={result.routes} />
      </section>

      <section aria-label="Peta rute hasil optimasi">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Visualisasi Peta Rute</h2>
        <RouteResultMap routes={result.routes} isLoading={false} />
      </section>

      {result.skipped.length > 0 && (
        <section aria-label="Destinasi yang dilewati">
          <SkippedDestinationsList skipped={result.skipped} />
        </section>
      )}
    </div>
  );
}

export function OptimizationPage() {
  const mutation = useTriggerOptimization();

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
            <RouteIcon className="h-5 w-5 text-brand" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Optimasi Rute Harian
            </h1>
            <p className="text-sm text-muted-foreground">
              Jalankan perencanaan rute armada untuk hari ini
            </p>
          </div>
        </div>
        <Button
          onClick={() => mutation.mutate()}
          loading={mutation.isPending}
          disabled={mutation.isPending}
          className="cursor-pointer"
        >
          <PlayIcon className="h-4 w-4" />
          {mutation.isPending ? "Memproses..." : "Jalankan Optimasi"}
        </Button>
      </header>

      {mutation.isPending && !mutation.data && (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      )}

      {mutation.data && <ResultPanel result={mutation.data} />}

      {!mutation.data && !mutation.isPending && (
        <EmptyState
          title="Belum ada hasil optimasi"
          description="Klik tombol 'Jalankan Optimasi' untuk membuat rencana rute harian."
        />
      )}
    </div>
  );
}