import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMenuItem } from "@/features/menu/api/menu.api";
import type { CreateMenuItemInput } from "@/shared/types/menu.types";

export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMenuItemInput) => createMenuItem(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["menu", "items"] });
    }
  });
}