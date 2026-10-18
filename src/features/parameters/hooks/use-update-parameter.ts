import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { updateParameter } from "@/features/parameters/api/parameters.api";
import type { UpdateParameterInput } from "@/shared/types/parameter.types";

export interface UpdateParameterVariables {
  readonly kunci: string;
  readonly input: UpdateParameterInput;
}

export function useUpdateParameter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdateParameterVariables) =>
      updateParameter(variables.kunci, variables.input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.parameters });
    }
  });
}