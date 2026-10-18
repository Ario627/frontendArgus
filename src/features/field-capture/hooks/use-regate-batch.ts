import { useMutation, useQueryClient } from "@tanstack/react-query";
import { regateBatch } from "@/features/field-capture/api/capture.api";
import type { ReGateInput } from "@/shared/types/batch.types";

export interface RegateVariables {
  readonly batchId: string;
  readonly patch: ReGateInput;
}

export function useRegateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: RegateVariables) => regateBatch(variables.batchId, variables.patch),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["batches"] });
      void queryClient.invalidateQueries({ queryKey: ["ledger", variables.batchId] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}