import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createFacility,
  saveFacilityProfile,
  updateFacility
} from "@/features/facilities/api/facilities.api";
import type { AcceptanceProfileRules } from "@/shared/types/facility.types";

function useInvalidateFacilities() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["facilities"] });
    void queryClient.invalidateQueries({ queryKey: ["audit"] });
  };
}

export function useCreateFacility() {
  const invalidate = useInvalidateFacilities();
  return useMutation({ mutationFn: createFacility, onSuccess: invalidate });
}

export interface UpdateFacilityVariables {
  readonly facilityId: string;
  readonly input: Parameters<typeof updateFacility>[1];
}

export function useUpdateFacility() {
  const invalidate = useInvalidateFacilities();
  return useMutation({
    mutationFn: (variables: UpdateFacilityVariables) =>
      updateFacility(variables.facilityId, variables.input),
    onSuccess: invalidate
  });
}

export interface SaveProfileVariables {
  readonly facilityId: string;
  readonly rules: AcceptanceProfileRules;
}

export function useSaveFacilityProfile() {
  const invalidate = useInvalidateFacilities();
  return useMutation({
    mutationFn: (variables: SaveProfileVariables) =>
      saveFacilityProfile(variables.facilityId, variables.rules),
    onSuccess: invalidate
  });
}
