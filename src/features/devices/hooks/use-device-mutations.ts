import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDevice,
  revokeDevice,
  rotateDeviceSecret
} from "@/features/devices/api/devices.api";

function useInvalidateDevices() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["devices"] });
    void queryClient.invalidateQueries({ queryKey: ["audit"] });
  };
}

export function useCreateDevice() {
  const invalidate = useInvalidateDevices();
  return useMutation({
    mutationFn: createDevice,
    onSuccess: invalidate
  });
}

export function useRevokeDevice() {
  const invalidate = useInvalidateDevices();
  return useMutation({
    mutationFn: revokeDevice,
    onSuccess: invalidate
  });
}

export function useRotateDeviceSecret() {
  const invalidate = useInvalidateDevices();
  return useMutation({
    mutationFn: rotateDeviceSecret,
    onSuccess: invalidate
  });
}
