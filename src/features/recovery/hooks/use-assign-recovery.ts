import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { recoveryApi } from "../api/recovery.api";
import { queryKeys } from "../../../api/query-keys";
import { ApiError, getDisplayMessage } from "../../../api/api-error";
import type { RecoveryAssignFormValues } from "../schemas/recovery-assign.schema";

export function useAssignRecovery() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (values: RecoveryAssignFormValues) =>
      recoveryApi.assign({
        brokenFleetId: values.brokenFleetId,
        receivingFleetIds: values.receivingFleetIds,
        redistributedStopIds: values.redistributedStopIds,
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.recovery.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.summary });
      if (data.status === "no_receiver") {
        toast.warning("Assign selesai namun masih tidak ada penerima cocok", {
          id: "recovery-assign-no-receiver",
        });
      } else {
        toast.success("Assign recovery berhasil", {
          id: "recovery-assign-success",
        });
      }
    },
    onError: (error: ApiError) => {
      toast.error(getDisplayMessage(error), { id: "recovery-assign-error" });
    },
  });
}