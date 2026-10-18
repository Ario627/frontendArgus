import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { isApiError } from "@/api/api-error";
import { useBatches } from "@/features/batch/hooks/use-batches";
import { useLinkScale } from "@/features/scale/hooks/use-link-scale";
import { Button } from "@/shared/components/ui/button";
import { Sheet } from "@/shared/components/ui/sheet";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { cn } from "@/shared/lib/cn";
import { formatKg } from "@/shared/lib/format";
import type { BatchDto } from "@/shared/types/batch.types";
import type { ScalePendingDto } from "@/shared/types/scale.types";

export interface LinkScaleSheetProps {
  readonly pending: ScalePendingDto | null;
  readonly onOpenChange: (open: boolean) => void;
}

export function LinkScaleSheet({ pending, onOpenChange }: LinkScaleSheetProps) {
  const [selectedBatch, setSelectedBatch] = useState<BatchDto | null>(null);
  const mutation = useLinkScale();
  const showToast = useToastStore((state) => state.show);
  const queryClient = useQueryClient();

  const batches = useBatches(
    { status: "MENUNGGU_ANGKUT" },
    pending === null ? null : pending.sppgId
  );
  const candidates = (batches.data?.pages ?? []).flatMap((page) => page.items);

  const close = () => {
    onOpenChange(false);
    setSelectedBatch(null);
  };

  const submit = () => {
    if (pending === null || selectedBatch === null) return;
    mutation.mutate(
      { pendingId: pending.id, input: { batchId: selectedBatch.id } },
      {
        onSuccess: (result) => {
          showToast({
            message: result.duplicate
              ? "Bacaan ini sudah pernah ditautkan."
              : `Bacaan ${formatKg(result.pending.beratKg, "device")} ditautkan ke batch ${selectedBatch.id.slice(0, 8)}.`
          });
          void queryClient.invalidateQueries({ queryKey: ["scale"] });
          close();
        },
        onError: (cause) => {
          showToast({
            message: isApiError(cause) ? cause.message : "Bacaan tidak dapat ditautkan.",
            tone: "bata"
          });
        }
      }
    );
  };

  return (
    <Sheet
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open) close();
        else onOpenChange(true);
      }}
      title="Tautkan bacaan timbangan"
      description={
        pending === null
          ? ""
          : `Bacaan ${formatKg(pending.beratKg, "device")} menjadi bukti DITIMBANG pada batch yang dipilih.`
      }
      footer={
        <Button
          fullWidth
          disabled={selectedBatch === null}
          loading={mutation.isPending}
          onClick={submit}
        >
          Tautkan ke batch
        </Button>
      }
    >
      {batches.isPending && pending !== null ? (
        <p className="text-sm text-ink-lemah">Memuat batch menunggu angkut...</p>
      ) : null}

      {batches.isError ? (
        <p className="text-sm text-bata">Daftar batch tidak dapat dimuat. Coba lagi nanti.</p>
      ) : null}

      {!batches.isPending && candidates.length === 0 ? (
        <p className="text-sm text-ink-lemah">
          Tidak ada batch berstatus menunggu angkut untuk SPPG ini. Catat batch dulu dari aplikasi
          lapangan.
        </p>
      ) : null}

      {candidates.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {candidates.map((batch) => {
            const active = selectedBatch?.id === batch.id;
            const sameSppg = pending === null || batch.sppgId === pending.sppgId;
            return (
              <li key={batch.id}>
                <button
                  type="button"
                  disabled={!sameSppg}
                  onClick={() => setSelectedBatch(batch)}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full flex-col gap-0.5 rounded-kontrol border px-3 py-2.5 text-left transition-colors",
                    active ? "border-biru-tinta bg-biru-tinta/5" : "border-garis hover:border-ink-lemah",
                    !sameSppg && "cursor-not-allowed opacity-50"
                  )}
                >
                  <span className="font-mono text-sm text-ink">{batch.id.slice(0, 8)}</span>
                  <span className="flex flex-wrap gap-x-3 text-xs text-ink-lemah">
                    <span className="font-mono">{formatKg(batch.weightKg, "manual")}</span>
                    <span>{batch.aliran}</span>
                    <span>{batch.status.toLowerCase()}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </Sheet>
  );
}
