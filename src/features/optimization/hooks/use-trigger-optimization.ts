import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { optimizationApi } from "../api/optimization.api";
import { queryKeys } from "../../../api/query-keys";
import { ApiError, getDisplayMessage } from "../../../api/api-error";

export function useTriggerOptimization() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => optimizationApi.triggerDailyPlan(),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.optimization.all });
      if (data.status === "NO_SOLUTION") {
        toast.warning(
          "Optimasi selesai namun tidak menemukan solusi feasible",
          {
            id: "optimization-no-solution",
          },
        );
      } else if (data.status === "FEASIBLE") {
        toast.success("Optimasi selesai dengan solusi sub-optimal", {
          id: "optimization-feasible",
        });
      } else {
        toast.success("Optimasi harian berhasil dijalankan", {
          id: "optimization-success",
        });
      }
    },
    onError: (error: ApiError) => {
      toast.error(getDisplayMessage(error), { id: "optimization-error" });
    },
  });
}