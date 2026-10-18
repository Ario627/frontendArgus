import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmStop } from "@/features/routes/api/routes.api";
import { qk } from "@/api/query-keys";
import type { ConfirmableStopStatus } from "@/shared/constants/route.constant";

export interface ConfirmStopVariables {
  readonly planId: string;
  readonly stopId: string;
  readonly status: ConfirmableStopStatus;
}

export function useConfirmStop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: ConfirmStopVariables) =>
      confirmStop(variables.planId, variables.stopId, { status: variables.status }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: qk.routes.detail(variables.planId) });
      void queryClient.invalidateQueries({ queryKey: ["routes", "list"] });
    }
  });
}