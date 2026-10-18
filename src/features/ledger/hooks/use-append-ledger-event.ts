import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { useOutboxStore } from "@/features/outbox/outbox.store";
import { newClientEventId } from "@/shared/lib/id";
import type { AppendEventInput } from "@/shared/types/ledger.types";

export type AppendOutcome = "terkirim" | "menunggu";

export interface AppendVariables {
  readonly batchId: string;
  readonly input: Omit<AppendEventInput, "clientEventId">;
}

export function useAppendLedgerEvent() {
  const enqueue = useOutboxStore((state) => state.enqueue);
  const syncNow = useOutboxStore((state) => state.syncNow);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: AppendVariables): Promise<{ outcome: AppendOutcome }> => {
      const clientEventId = newClientEventId();
      await enqueue({
        tipe: "ledger_event",
        refId: variables.batchId,
        payload: { ...variables.input, clientEventId } as Record<string, unknown>
      });
      await syncNow();
      const queued = useOutboxStore.getState().items.find((item) => item.id === clientEventId);
      return { outcome: queued?.status === "terkirim" ? "terkirim" : "menunggu" };
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: qk.ledger.list(variables.batchId) });
      void queryClient.invalidateQueries({ queryKey: qk.batches.detail(variables.batchId) });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}