import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSppg,
  createSppgPoint,
  updateSppg,
  updateSppgPoint
} from "@/features/sppg/api/sppg.api";

function useInvalidateSppg() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["sppg"] });
    void queryClient.invalidateQueries({ queryKey: ["audit"] });
  };
}

export function useCreateSppg() {
  const invalidate = useInvalidateSppg();
  return useMutation({ mutationFn: createSppg, onSuccess: invalidate });
}

export interface UpdateSppgVariables {
  readonly sppgId: string;
  readonly input: Parameters<typeof updateSppg>[1];
}

export function useUpdateSppg() {
  const invalidate = useInvalidateSppg();
  return useMutation({
    mutationFn: (variables: UpdateSppgVariables) =>
      updateSppg(variables.sppgId, variables.input),
    onSuccess: invalidate
  });
}

export interface CreatePointVariables {
  readonly sppgId: string;
  readonly input: Parameters<typeof createSppgPoint>[1];
}

export function useCreateSppgPoint() {
  const invalidate = useInvalidateSppg();
  return useMutation({
    mutationFn: (variables: CreatePointVariables) =>
      createSppgPoint(variables.sppgId, variables.input),
    onSuccess: invalidate
  });
}

export interface UpdatePointVariables {
  readonly sppgId: string;
  readonly pointId: string;
  readonly input: Parameters<typeof updateSppgPoint>[2];
}

export function useUpdateSppgPoint() {
  const invalidate = useInvalidateSppg();
  return useMutation({
    mutationFn: (variables: UpdatePointVariables) =>
      updateSppgPoint(variables.sppgId, variables.pointId, variables.input),
    onSuccess: invalidate
  });
}
