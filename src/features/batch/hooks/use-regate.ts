import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { regateBatch } from "@/features/batch/api/batch.api";
import type { ReGateInput } from "@/shared/types/batch.types";

export interface RegateVariables {
  readonly batchId: string;
  readonly patch: ReGateInput;
}

export function useRegate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: RegateVariables) => regateBatch(variables.batchId, variables.patch),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: qk.batches.detail(variables.batchId) });
      void queryClient.invalidateQueries({ queryKey: ["batches", "list"] });
      void queryClient.invalidateQueries({ queryKey: qk.ledger.list(variables.batchId) });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}