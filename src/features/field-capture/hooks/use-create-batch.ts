import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBatch } from "@/features/field-capture/api/capture.api";
import type { CreateBatchInput } from "@/shared/types/batch.types";

export function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBatchInput) => createBatch(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["batches", "list"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}