import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFleet, updateFleet } from "@/features/fleet/api/fleet.api";

function useInvalidateFleet() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["fleet"] });
    void queryClient.invalidateQueries({ queryKey: ["audit"] });
  };
}

export function useCreateFleet() {
  const invalidate = useInvalidateFleet();
  return useMutation({ mutationFn: createFleet, onSuccess: invalidate });
}

export interface UpdateFleetVariables {
  readonly fleetId: string;
  readonly input: Parameters<typeof updateFleet>[1];
}

export function useUpdateFleet() {
  const invalidate = useInvalidateFleet();
  return useMutation({
    mutationFn: (variables: UpdateFleetVariables) =>
      updateFleet(variables.fleetId, variables.input),
    onSuccess: invalidate
  });
}
