import { useMutation, useQueryClient } from "@tanstack/react-query";
import { closeAnomaly } from "@/features/anomalies/api/anomalies.api";

export interface CloseAnomalyVariables {
  readonly anomalyId: string;
  readonly catatan: string;
}

export function useCloseAnomaly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: CloseAnomalyVariables) =>
      closeAnomaly(variables.anomalyId, variables.catatan),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["anomalies"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}
