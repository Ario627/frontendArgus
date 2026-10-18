import { useMutation } from "@tanstack/react-query";
import { mintStrukLink } from "@/features/batch/api/batch.api";

export function useMintStruk() {
  return useMutation({
    mutationFn: (batchId: string) => mintStrukLink(batchId)
  });
}