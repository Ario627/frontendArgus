import axios, {
  isAxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse
} from "axios";
import { normalizeApiError } from "@/api/api-error";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { env } from "@/shared/lib/env";
import { logDev } from "@/shared/lib/logger";
import type { ApiSuccessEnvelope } from "@/shared/types/api.types";

const REQUEST_TIMEOUT_MS = 15_000;

declare module "axios" {
  export interface AxiosRequestConfig {
    rawResponse?: boolean;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSuccessEnvelope(value: unknown): value is ApiSuccessEnvelope<unknown> {
  return isRecord(value) && value["success"] === true && "data" in value;
}

function hadAuthorizationHeader(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const headers: unknown = error.config?.headers;
  if (!isRecord(headers)) return false;
  const header = headers["Authorization"] ?? headers["authorization"];
  return typeof header === "string" && header.length > 0;
}

function unwrapEnvelope(response: AxiosResponse): AxiosResponse {
  if (response.config.rawResponse === true) return response;
  const body: unknown = response.data;
  response.data = isSuccessEnvelope(body) ? body.data : body;
  return response;
}

export const http: AxiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT_MS,
  headers: { Accept: "application/json" }
});

http.interceptors.request.use((config) => {
  config.baseURL = env.VITE_API_URL;
  const token = useAuthStore.getState().token;
  if (token !== null) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

http.interceptors.response.use(
  (response) => unwrapEnvelope(response),
  (error: unknown) => {
    const apiError = normalizeApiError(error);
    logDev("http", `${apiError.method ?? "HTTP"} ${apiError.url ?? ""} ${apiError.status} ${apiError.code}`);
    if (apiError.status === 401 && hadAuthorizationHeader(error)) {
      useAuthStore.getState().forceLogout("sesi-berakhir");
    }
    return Promise.reject(apiError);
  }
);

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await http.request<T>(config);
  return response.data;
}

export function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ ...config, method: "GET", url });
}

export function apiPost<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ ...config, method: "POST", url, data });
}

export function apiPut<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ ...config, method: "PUT", url, data });
}

export function apiPatch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ ...config, method: "PATCH", url, data });
}

export function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ ...config, method: "DELETE", url });
}

export function apiUpload<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ ...config, method: "POST", url, data: formData });
}

export async function apiBlob(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<Blob>> {
  return http.request<Blob>({ ...config, method: "GET", url, responseType: "blob", rawResponse: true });
}