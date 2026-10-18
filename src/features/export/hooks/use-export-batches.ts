import { useMutation, useQueryClient } from "@tanstack/react-query";
import { downloadBatchesExport, type ExportQuery } from "@/features/export/api/export.api";
import {
  buildExportFilename,
  readExportMeta,
  saveBlob,
  type ExportFormat,
  type ExportMeta
} from "@/features/export/export-download";

export interface ExportVariables {
  readonly format: ExportFormat;
  readonly query: ExportQuery;
}

export interface ExportResultView {
  readonly filename: string;
  readonly format: ExportFormat;
  readonly sizeBytes: number;
  readonly meta: ExportMeta;
}

export function useExportBatches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: ExportVariables): Promise<ExportResultView> => {
      const response = await downloadBatchesExport(variables.format, variables.query);
      const filename = buildExportFilename(
        variables.format,
        variables.query.from,
        variables.query.to
      );
      saveBlob(response.data, filename);
      return {
        filename,
        format: variables.format,
        sizeBytes: response.data.size,
        meta: readExportMeta(response)
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["audit"] });
    }
  });
}