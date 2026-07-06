import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { destinationApi } from "../api/destination.api";
import { queryKeys } from "../../../api/query-keys";
import { ApiError } from "../../../api/api-error";
import type { CreateDestinationFormValues } from "../schemas/create-destination.schema";

export function useCreateDestination() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateDestinationFormValues) =>
      destinationApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.destination.all });
      toast.success("Destinasi berhasil ditambahkan");
    },
    onError: (error: ApiError) => {
      if (error.status === 409) {
        toast.error("Nama destinasi sudah terdaftar", {
          id: "destination-create-409",
        });
      } else {
        toast.error(error.message ?? "Gagal menambahkan destinasi", {
          id: "destination-create-error",
        });
      }
    },
  });
}
