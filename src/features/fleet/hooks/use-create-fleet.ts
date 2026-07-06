import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fleetApi } from "../api/fleet.api";
import { queryKeys } from "../../../api/query-keys";
import { ApiError } from "../../../api/api-error";
import type { CreateFleetFormValues } from "../schemas/create-fleet.schema";

export function useCreateFleet() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateFleetFormValues) => fleetApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.fleet.all });
      toast.success("Armada berhasil ditambahkan");
    },
    onError: (error: ApiError) => {
      if (error.status === 409) {
        toast.error("Nomor polisi sudah terdaftar", { id: "fleet-create-409" });
      } else {
        toast.error(error.message ?? "Gagal menambahkan armada", {
          id: "fleet-create-error",
        });
      }
    },
  });
}