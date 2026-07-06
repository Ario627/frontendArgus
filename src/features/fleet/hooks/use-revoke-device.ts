import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fleetApi } from "../api/fleet.api";
import { queryKeys } from "../../../api/query-keys";
import { ApiError } from "../../../api/api-error";

interface UseRevokeDeviceOptions {
  readonly id: string;
}

export function useRevokeDevice({ id }: UseRevokeDeviceOptions) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => fleetApi.revokeDevice(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.fleet.all });
      qc.invalidateQueries({ queryKey: queryKeys.fleet.detail(id) });
      toast.success("Perangkat berhasil dicabut");
    },
    onError: (error: ApiError) => {
      if (error.status === 409) {
        toast.error("Perangkat sudah dicabut sebelumnya", {
          id: "fleet-revoke-409",
        });
      } else {
        toast.error(error.message ?? "Gagal mencabut perangkat", {
          id: "fleet-revoke-error",
        });
      }
    },
  });
}