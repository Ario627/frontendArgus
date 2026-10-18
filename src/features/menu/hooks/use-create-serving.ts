import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMenuServing } from "@/features/menu/api/menu.api";
import type { CreateServingInput } from "@/shared/types/menu.types";

export function useCreateServing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateServingInput) => createMenuServing(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["menu", "servings"] });
      void queryClient.invalidateQueries({ queryKey: ["audit"] });
    }
  });
}
