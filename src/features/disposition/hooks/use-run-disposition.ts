import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runDisposition } from "@/features/disposition/api/disposition.api";

export interface RunDispositionVariables {
  readonly sppgId: string;
  readonly date: string;
}

export function useRunDisposition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: RunDispositionVariables) =>
      runDisposition(variables.sppgId, variables.date),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dispositions"] });
      void queryClient.invalidateQueries({ queryKey: ["batches"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}