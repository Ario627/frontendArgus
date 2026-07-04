import type { AxiosError } from "axios";

interface BackendErrorEnvelope {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: readonly Record<string, string>[];
  };
  readonly timestamp: string;
  readonly path: string;
}

const ERROR_MESSAGES: Readonly<Record<string, string>> = Object.freeze({
  SERVICE_UNAVAILABLE:
    "Layanan optimisasi sedang sibuk, coba lagi dalam beberapa saat.",
  UNAUTHORIZED: "Sesi Anda telah berakhir, silakan login kembali.",
  FORBIDDEN: "Anda tidak memiliki akses untuk aksi ini.",
  VALIDATION_ERROR: "Periksa kembali data yang diisi.",
  RATE_LIMITED: "Terlalu banyak percobaan, coba lagi sebentar lagi.",
  NETWORK_ERROR:
    "Tidak dapat terhubung ke server, periksa koneksi internet Anda.",
});

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: readonly Record<string, string>[] | undefined;
  readonly requestId: string | undefined;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: readonly Record<string, string>[],
    requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }

  static fromAxiosError(error: AxiosError<BackendErrorEnvelope>): ApiError {
    const response = error.response;
    if (!response) {
      return new ApiError(0, "NETWORK_ERROR", ERROR_MESSAGES.NETWORK_ERROR);
    }
    const envelope = response.data;
    const code = envelope?.error?.code ?? "UNKNOWN_ERROR";
    const message = envelope?.error?.message ?? error.message;
    const details = envelope?.error?.details;
    const requestId = response.headers["x-request-id"] as string | undefined;
    return new ApiError(response.status, code, message, details, requestId);
  }
}

export function getDisplayMessage(err: ApiError): string {
  return (
    ERROR_MESSAGES[err.code] ?? err.message ?? "Terjadi kesalahan tak terduga."
  );
}