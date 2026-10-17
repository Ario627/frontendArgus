import { isAxiosError, type AxiosError } from "axios";
import type { ApiErrorDetail } from "@/shared/types/api.types";

export const CLIENT_ERROR_CODES = Object.freeze({
  NETWORK: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT_ERROR",
  CANCELLED: "REQUEST_CANCELLED",
  UNKNOWN: "UNKNOWN_ERROR"
});

const FALLBACK_MESSAGES: Readonly<Record<number, string>> = Object.freeze({
  400: "Permintaan tidak valid",
  401: "Sesi berakhir, silakan masuk kembali",
  403: "Anda tidak punya akses untuk tindakan ini",
  404: "Data tidak ditemukan",
  409: "Permintaan bertentangan dengan kondisi data saat ini",
  413: "Foto terlalu besar (maks 1 MB)",
  422: "Data yang dikirim tidak valid",
  429: "Terlalu banyak permintaan",
  500: "Terjadi kesalahan internal",
  502: "Layanan sedang tidak tersedia",
  503: "Layanan sedang tidak tersedia"
});

const DEFAULT_MESSAGE = "Terjadi kesalahan. Coba lagi sebentar lagi.";
const NETWORK_MESSAGE = "Tidak dapat terhubung ke server. Periksa jaringan lalu coba lagi.";
const TIMEOUT_MESSAGE = "Permintaan terlalu lama diproses. Coba lagi.";
const CANCELLED_MESSAGE = "Permintaan dibatalkan.";
const UNKNOWN_MESSAGE = "Terjadi kesalahan tak terduga. Coba lagi.";
const MAX_DETAILS = 20;
const MAX_CODE_LENGTH = 64;
const MAX_FIELD_LENGTH = 64;
const FIELD_SANITIZE_PATTERN = /[^A-Za-z0-9_.-]/g;

export interface ApiErrorInit {
  readonly status: number;
  readonly code: string;
  readonly message: string;
  readonly details?: readonly ApiErrorDetail[];
  readonly requestId?: string | null;
  readonly method?: string | null;
  readonly url?: string | null;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: readonly ApiErrorDetail[];
  readonly requestId: string | null;
  readonly method: string | null;
  readonly url: string | null;

  constructor(init: ApiErrorInit) {
    super(init.message);
    this.name = "ApiError";
    this.status = init.status;
    this.code = init.code;
    this.details = init.details ?? [];
    this.requestId = init.requestId ?? null;
    this.method = init.method ?? null;
    this.url = init.url ?? null;
  }
}

function clamp(value: string, maxLength: number): string {
  return value.length <= maxLength ? value : value.slice(0, maxLength);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

function normalizeStatus(status: number): number {
  return Number.isInteger(status) && status >= 400 && status <= 599 ? status : 500;
}

export function messageForStatus(status: number): string {
  const mapped = FALLBACK_MESSAGES[status];
  if (mapped !== undefined) return mapped;
  if (status >= 500) return FALLBACK_MESSAGES[500] ?? DEFAULT_MESSAGE;
  return DEFAULT_MESSAGE;
}

function codeForStatus(status: number): string {
  return status >= 500 ? "SYS_INTERNAL" : `HTTP_${status}`;
}

function sanitizeDetails(value: unknown): readonly ApiErrorDetail[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const details: ApiErrorDetail[] = [];
  for (const entry of value) {
    if (details.length >= MAX_DETAILS) break;
    if (!isRecord(entry)) continue;
    const rawCode = entry["code"];
    if (typeof rawCode !== "string" || rawCode.length === 0) continue;
    const rawField = entry["field"];
    const field = typeof rawField === "string" ? clamp(rawField.replace(FIELD_SANITIZE_PATTERN, ""), MAX_FIELD_LENGTH) : "";
    details.push(field.length > 0 ? { code: clamp(rawCode, MAX_CODE_LENGTH), field } : { code: clamp(rawCode, MAX_CODE_LENGTH) });
  }
  return details.length > 0 ? Object.freeze(details) : undefined;
}

interface ParsedErrorEnvelope {
  readonly code: string;
  readonly message: string;
  readonly details?: readonly ApiErrorDetail[];
}

function parseErrorEnvelope(body: unknown): ParsedErrorEnvelope | null {
  if (!isRecord(body) || body["success"] !== false) return null;
  const error = body["error"];
  if (!isRecord(error)) return null;
  const rawCode = error["code"];
  const rawMessage = error["message"];
  if (typeof rawCode !== "string" || rawMessage === undefined || typeof rawMessage !== "string") return null;
  const code = clamp(rawCode, MAX_CODE_LENGTH);
  const details = sanitizeDetails(error["details"]);
  return details === undefined ? { code, message: rawMessage } : { code, message: rawMessage, details };
}

function readRequestId(error: AxiosError): string | null {
  const headers: unknown = error.response?.headers;
  if (!isRecord(headers)) return null;
  const value = headers["x-request-id"];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function fromAxiosError(error: AxiosError): ApiError {
  const rawMethod = error.config?.method;
  const rawUrl = error.config?.url;
  const method = typeof rawMethod === "string" ? rawMethod.toUpperCase() : null;
  const url = typeof rawUrl === "string" ? rawUrl : null;
  if (error.response !== undefined) {
    const status = normalizeStatus(error.response.status);
    const parsed = parseErrorEnvelope(error.response.data);
    return new ApiError({
      status,
      code: parsed?.code ?? codeForStatus(status),
      message: parsed?.message ?? messageForStatus(status),
      details: parsed?.details,
      requestId: readRequestId(error),
      method,
      url
    });
  }
  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return new ApiError({ status: 0, code: CLIENT_ERROR_CODES.TIMEOUT, message: TIMEOUT_MESSAGE, method, url });
  }
  if (error.code === "ERR_CANCELED") {
    return new ApiError({ status: 0, code: CLIENT_ERROR_CODES.CANCELLED, message: CANCELLED_MESSAGE, method, url });
  }
  return new ApiError({ status: 0, code: CLIENT_ERROR_CODES.NETWORK, message: NETWORK_MESSAGE, method, url });
}

export function normalizeApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;
  if (isAxiosError(error)) return fromAxiosError(error);
  if (error instanceof Error && error.name === "AbortError") {
    return new ApiError({ status: 0, code: CLIENT_ERROR_CODES.CANCELLED, message: CANCELLED_MESSAGE });
  }
  return new ApiError({ status: 0, code: CLIENT_ERROR_CODES.UNKNOWN, message: UNKNOWN_MESSAGE });
}

export function isRetryableError(error: unknown): boolean {
  if (!isApiError(error)) return false;
  if (error.code === CLIENT_ERROR_CODES.CANCELLED || error.code === CLIENT_ERROR_CODES.UNKNOWN) return false;
  if (error.status === 0) return true;
  return error.status >= 500 || error.status === 408;
}

export function getErrorMessage(error: unknown): string {
  return isApiError(error) ? error.message : UNKNOWN_MESSAGE;
}