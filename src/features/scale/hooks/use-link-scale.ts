import { useMutation, useQueryClient } from "@tanstack/react-query";
import { linkScale, type LinkScaleVariables } from "@/features/scale/api/scale.api";

export function useLinkScale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: LinkScaleVariables) => linkScale(variables),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["scale"] });
      void queryClient.invalidateQueries({ queryKey: ["batches"] });
      void queryClient.invalidateQueries({ queryKey: ["ledger"] });
      void queryClient.invalidateQueries({ queryKey: ["audit"] });
    }
  });
}
