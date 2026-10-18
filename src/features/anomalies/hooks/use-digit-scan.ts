import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runDigitScan } from "@/features/anomalies/api/anomalies.api";
import type { DigitScanInput } from "@/shared/types/digit.types";

export function useDigitScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DigitScanInput) => runDigitScan(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["anomalies"] });
      void queryClient.invalidateQueries({ queryKey: ["audit"] });
    }
  });
}
