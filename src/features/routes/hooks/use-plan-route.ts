import { useMutation, useQueryClient } from "@tanstack/react-query";
import { planRoute } from "@/features/routes/api/routes.api";
import type { PlanRouteInput } from "@/shared/types/route.types";

export function usePlanRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PlanRouteInput) => planRoute(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["routes"] });
      void queryClient.invalidateQueries({ queryKey: ["batches"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}