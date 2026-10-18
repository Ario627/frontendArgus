import { AxiosHeaders, type AxiosResponse, type RawAxiosHeaders } from "axios";

export type ExportFormat = "csv" | "pdf";

export const EXPORT_DEFAULT_RANGE_DAYS = 30;
export const EXPORT_MAX_RANGE_DAYS = 366;

const DAY_MS = 86_400_000;

export interface ExportMeta {
  readonly rows: number | null;
  readonly pages: number | null;
  readonly truncated: boolean | null;
  readonly quotaRemaining: number | null;
}

export function buildExportFilename(format: ExportFormat, from: string, to: string): string {
  return `argus-batch-${from}_${to}.${format}`;
}

export function rangeDaysInclusive(from: string, to: string): number {
  const fromMs = Date.parse(`${from}T00:00:00.000Z`);
  const toMs = Date.parse(`${to}T00:00:00.000Z`);
  if (Number.isNaN(fromMs) || Number.isNaN(toMs)) return 0;
  return Math.floor((toMs - fromMs) / DAY_MS) + 1;
}

function headerNumber(headers: AxiosHeaders, name: string): number | null {
  const raw = headers.get(name);
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toAxiosHeaders(source: AxiosResponse<Blob>["headers"]): AxiosHeaders {
  if (source instanceof AxiosHeaders) return source;
  const normalized: RawAxiosHeaders = {};
  for (const [key, value] of Object.entries(source ?? {})) {
    if (value === undefined || value === null) continue;
    normalized[key] = value;
  }
  return AxiosHeaders.from(normalized);
}

export function readExportMeta(response: AxiosResponse<Blob>): ExportMeta {
  const headers = toAxiosHeaders(response.headers);
  const truncatedRaw = headers.get("x-export-truncated");
  return {
    rows: headerNumber(headers, "x-export-rows"),
    pages: headerNumber(headers, "x-export-pages"),
    truncated: truncatedRaw === "true" ? true : truncatedRaw === "false" ? false : null,
    quotaRemaining: headerNumber(headers, "x-export-quota-remaining")
  };
}

export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}