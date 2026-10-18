import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutboxStore } from "@/features/outbox/outbox.store";
import { newClientEventId } from "@/shared/lib/id";
import type { LeftoverLevel } from "@/shared/constants/leftover.constant";

export type ObservationOutcome = "terkirim" | "menunggu";

export interface CreateObservationVariables {
  readonly tanggal: string;
  readonly titikId: string;
  readonly menuItemId: string;
  readonly tingkatSisa: LeftoverLevel;
  readonly jumlahPorsiDinilai: number;
}

export function useCreateObservation() {
  const enqueue = useOutboxStore((state) => state.enqueue);
  const syncNow = useOutboxStore((state) => state.syncNow);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: CreateObservationVariables): Promise<{ outcome: ObservationOutcome }> => {
      const clientEventId = newClientEventId();
      await enqueue({
        tipe: "observasi_sisa",
        payload: { ...variables, clientEventId } as Record<string, unknown>
      });
      await syncNow();
      const queued = useOutboxStore.getState().items.find((item) => item.id === clientEventId);
      return { outcome: queued?.status === "terkirim" ? "terkirim" : "menunggu" };
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["menu", "insights"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}