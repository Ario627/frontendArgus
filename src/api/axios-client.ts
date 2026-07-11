import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "../lib/env";
import { ApiError } from "./api-error";
import { toast } from "sonner";
import { useAuthStore } from "../features/auth/store/auth.store";
interface BackendSuccessEnvelope<T> {
  readonly data: T;
  readonly success: true;
  readonly timestamp: string;
}

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

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const envelope = response.data as BackendSuccessEnvelope<unknown>;
    if (
      envelope &&
      typeof envelope === "object" &&
      "success" in envelope &&
      "data" in envelope &&
      envelope.success === true
    ) {
      response.data = envelope.data;
    }
    return response;
  },
  (error: AxiosError<BackendErrorEnvelope>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      toast.error("Sesi berakhir, silakan login kembali");
      window.location.href = "/login";
    }

    const method = error.config?.method?.toUpperCase() ?? "UNKNOWN";
    const url = error.config?.url ?? "unknown";
    const statusCode = error.response?.status ?? 0;
    const errorCode = error.response?.data?.error?.code ?? "NETWORK_ERROR";
    console.error(`[API] ${method} ${url} → ${statusCode} (${errorCode})`);

    return Promise.reject(ApiError.fromAxiosError(error));
  },
);
