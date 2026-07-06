import { apiClient } from "../../../api/axios-client";
import { API_ENDPOINTS } from "../../../api/endpoints";
import type { LoginCredentials } from "../schemas/login.schema";

interface LoginResponse {
  readonly accessToken: string;
}

export const authApi = Object.freeze({
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.auth.login,
      credentials,
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.auth.logout);
  },
});