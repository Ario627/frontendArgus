import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fleetApi } from "../api/fleet.api";
import { queryKeys } from "../../../api/query-keys";
import { ApiError } from "../../../api/api-error";

export function useDeleteFleet() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fleetApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.fleet.all });
      toast.success("Armada berhasil dihapus");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Gagal menghapus armada", {
        id: "fleet-delete-error",
      });
    },
  });
}