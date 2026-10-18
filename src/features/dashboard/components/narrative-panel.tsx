import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDashboardNarrative } from "@/features/dashboard/api/dashboard.api";
import { useDashboardNarrative } from "@/features/dashboard/hooks/use-dashboard-narrative";
import { Button } from "@/shared/components/ui/button";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { formatDateTime } from "@/shared/lib/format";
import type { NarrativeView } from "@/shared/types/dashboard.types";

export interface NarrativePanelProps {
  readonly sppgId: string | null;
  readonly canRefresh: boolean;
}

export function NarrativePanel({ sppgId, canRefresh }: NarrativePanelProps) {
  const query = useDashboardNarrative(sppgId, true);
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  const refresh = useMutation({
    mutationFn: () => fetchDashboardNarrative({ sppgId, refresh: true }),
    onSuccess: (view) => {
      queryClient.setQueryData(["dashboard", "narrative", sppgId ?? "semua"], view);
      if (view.status === "PENDING") {
        showToast({ message: "Narasi sedang disusun. Halaman akan memperbarui sendiri." });
      }
    },
    onError: () => {
      showToast({ message: "Narasi tidak dapat disusun ulang.", tone: "bata" });
    }
  });

  const view: NarrativeView | undefined = query.data;

  if (view === undefined || view.status === "DISABLED") return null;

  return (
    <section
      aria-label="Narasi harian"
      className="flex flex-col gap-2 rounded-kontainer border border-garis px-4 py-3"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-ink">Catatan harian</h2>
        {view.status === "READY" && canRefresh ? (
          <Button
            variant="ghost"
            size="sm"
            loading={refresh.isPending}
            onClick={() => refresh.mutate()}
          >
            Susun ulang
          </Button>
        ) : null}
      </div>

      {view.status === "PENDING" ? (
        <p className="text-sm text-ink-lemah">
          Narasi sedang disusun{view.retryAfterSeconds === null ? "" : ` · sekitar ${view.retryAfterSeconds} detik`}.
        </p>
      ) : null}

      {view.status === "READY" && view.narasi !== null ? (
        <>
          <p className="max-w-prose text-sm leading-relaxed whitespace-pre-line text-ink">
            {view.narasi}
          </p>
          <p className="font-mono text-2xs text-ink-lemah">
            {view.model ?? "model internal"}
            {view.generatedAt === null ? "" : ` · ${formatDateTime(view.generatedAt)}`}
          </p>
        </>
      ) : null}

      {view.status === "READY" && view.narasi === null && view.reason !== null ? (
        <p className="text-sm text-ink-lemah">{view.reason}</p>
      ) : null}
    </section>
  );
}
