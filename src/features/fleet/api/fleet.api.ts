import { apiClient } from "../../../api/axios-client";
import { API_ENDPOINTS } from "../../../api/endpoints";
import type { PaginatedResponse } from "../../../shared/types/common.types";
import type { Fleet } from "../../../shared/types/fleet.types";
import type { CreateFleetFormValues } from "../schemas/create-fleet.schema";
import type { UpdateFleetFormValues } from "../schemas/update-fleet.schema";

interface DeleteFleetResponse {
  readonly id: string;
}

export const fleetApi = Object.freeze({
  list: async (page = 1, limit = 20): Promise<PaginatedResponse<Fleet>> => {
    const response = await apiClient.get<PaginatedResponse<Fleet>>(
      API_ENDPOINTS.fleet.list,
      { params: { page, limit } },
    );
    return response.data;
  },

  detail: async (id: string): Promise<Fleet> => {
    const response = await apiClient.get<Fleet>(API_ENDPOINTS.fleet.detail(id));
    return response.data;
  },

  create: async (values: CreateFleetFormValues): Promise<Fleet> => {
    const response = await apiClient.post<Fleet>(
      API_ENDPOINTS.fleet.create,
      values,
    );
    return response.data;
  },

  update: async (id: string, values: UpdateFleetFormValues): Promise<Fleet> => {
    const response = await apiClient.patch<Fleet>(
      API_ENDPOINTS.fleet.update(id),
      values,
    );
    return response.data;
  },

  remove: async (id: string): Promise<DeleteFleetResponse> => {
    const response = await apiClient.delete<DeleteFleetResponse>(
      API_ENDPOINTS.fleet.remove(id),
    );
    return response.data;
  },

  revokeDevice: async (id: string): Promise<Fleet> => {
    const response = await apiClient.post<Fleet>(
      API_ENDPOINTS.fleet.revokeDevice(id),
    );
    return response.data;
  },

  exportCsv: async (): Promise<Blob> => {
    const response = await apiClient.get(API_ENDPOINTS.fleet.exportCsv, {
      responseType: "blob",
    });
    return response.data as Blob;
  },
});