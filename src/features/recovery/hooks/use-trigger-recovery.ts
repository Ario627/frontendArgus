import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { recoveryApi } from "../api/recovery.api";
import { ApiError, getDisplayMessage } from "../../../api/api-error";
import type { RecoveryTriggerPayload } from "../../../shared/types/recovery.types";

export function useTriggerRecovery() {
  return useMutation({
    mutationFn: (payload: RecoveryTriggerPayload) =>
      recoveryApi.trigger(payload),
    onSuccess: (data) => {
      if (data.status === "no_receiver") {
        toast.warning(
          "Tidak ada armada penerima yang cocok --- assign manual diperlukan",
          { id: "recovery-no-receiver", duration: 6000 },
        );
      } else if (data.status === "fallback_greedy" || data.fallback) {
        toast.success("Recovery berhasil (mode cadangan)", {
          id: "recovery-fallback",
        });
      } else {
        toast.success("Recovery berhasil dijalankan", {
          id: "recovery-success",
        });
      }
    },
    onError: (error: ApiError) => {
      toast.error(getDisplayMessage(error), { id: "recovery-trigger-error" });
    },
  });
}