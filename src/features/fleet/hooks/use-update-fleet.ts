import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fleetApi } from "../api/fleet.api";
import { queryKeys } from "../../../api/query-keys";
import { ApiError } from "../../../api/api-error";
import type { UpdateFleetFormValues } from "../schemas/update-fleet.schema";

interface UseUpdateFleetOptions {
  readonly id: string;
}

export function useUpdateFleet({ id }: UseUpdateFleetOptions) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (values: UpdateFleetFormValues) => fleetApi.update(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.fleet.all });
      qc.invalidateQueries({ queryKey: queryKeys.fleet.detail(id) });
      toast.success("Armada berhasil diperbarui");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Gagal memperbarui armada", {
        id: "fleet-update-error",
      });
    },
  });
}