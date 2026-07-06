import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { destinationApi } from "../api/destination.api";
import { queryKeys } from "../../../api/query-keys";
import { ApiError } from "../../../api/api-error";
import type { UpdateDestinationFormValues } from "../schemas/update-destination.schema";

interface UseUpdateDestinationOptions {
  readonly id: string;
}

export function useUpdateDestination({ id }: UseUpdateDestinationOptions) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (values: UpdateDestinationFormValues) =>
      destinationApi.update(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.destination.all });
      qc.invalidateQueries({ queryKey: queryKeys.destination.detail(id) });
      toast.success("Destinasi berhasil diperbarui");
    },
    onError: (error: ApiError) => {
      if (error.status === 409) {
        toast.error("Nama destinasi sudah digunakan", {
          id: "destination-update-409",
        });
      } else {
        toast.error(error.message ?? "Gagal memperbarui destinasi", {
          id: "destination-update-error",
        });
      }
    },
  });
}
