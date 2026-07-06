import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { destinationApi } from "../api/destination.api";
import { queryKeys } from "../../../api/query-keys";
import { ApiError } from "../../../api/api-error";

export function useDeleteDestination() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => destinationApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.destination.all });
      toast.success("Destinasi berhasil dihapus");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Gagal menghapus destinasi", {
        id: "destination-delete-error",
      });
    },
  });
}
