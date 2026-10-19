import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assignBatch,
  runAutoDispatch,
  type AssignBatchInput
} from "@/features/dispatch/api/dispatch.api";

function useInvalidateDispatch() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["dispatch"] });
    void queryClient.invalidateQueries({ queryKey: ["routes"] });
    void queryClient.invalidateQueries({ queryKey: ["batches"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    void queryClient.invalidateQueries({ queryKey: ["audit"] });
  };
}

export function useAssignBatch() {
  const invalidate = useInvalidateDispatch();
  return useMutation({
    mutationFn: (input: AssignBatchInput) => assignBatch(input),
    onSuccess: invalidate
  });
}

export function useAutoDispatch() {
  const invalidate = useInvalidateDispatch();
  return useMutation({
    mutationFn: (sppgId: string | null) => runAutoDispatch(sppgId),
    onSuccess: invalidate
  });
}
