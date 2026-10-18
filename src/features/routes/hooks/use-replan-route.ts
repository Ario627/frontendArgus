import { useMutation, useQueryClient } from "@tanstack/react-query";
import { replanRoute } from "@/features/routes/api/routes.api";

export function useReplanRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => replanRoute(planId),
    onSuccess: (_data, planId) => {
      void queryClient.invalidateQueries({ queryKey: qkRoutesDetail(planId) });
      void queryClient.invalidateQueries({ queryKey: ["routes"] });
      void queryClient.invalidateQueries({ queryKey: ["batches"] });
    }
  });
}

function qkRoutesDetail(planId: string): readonly string[] {
  return ["routes", planId];
}