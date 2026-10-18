import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmTransfer, type TransferConfirmInput } from "@/features/ledger/api/ledger.api";

export interface ConfirmTransferVariables {
  readonly batchId: string;
  readonly input: TransferConfirmInput;
}

export function useConfirmTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: ConfirmTransferVariables) =>
      confirmTransfer(variables.batchId, variables.input),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["ledger", variables.batchId] });
      void queryClient.invalidateQueries({ queryKey: ["batches"] });
      void queryClient.invalidateQueries({ queryKey: ["routes"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}
