import type { AxiosResponse } from "axios";
import { apiBlob } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import { toSearchParams } from "@/shared/lib/search-params";
import type { ExportFormat } from "@/features/export/export-download";

export type ExportQuery = {
  readonly from: string;
  readonly to: string;
  readonly sppgId?: string;
}

export function downloadBatchesExport(
  format: ExportFormat,
  query: ExportQuery
): Promise<AxiosResponse<Blob>> {
  const path = format === "csv" ? endpoints.export.batchesCsv : endpoints.export.batchesPdf;
  return apiBlob(`${path}${toSearchParams(query)}`);
}