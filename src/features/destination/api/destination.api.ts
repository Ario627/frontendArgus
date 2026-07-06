import { apiClient } from "../../../api/axios-client";
import { API_ENDPOINTS } from "../../../api/endpoints";
import type { PaginatedResponse } from "../../../shared/types/common.types";
import type { Destination } from "../../../shared/types/destination.types";
import type { CreateDestinationFormValues } from "../schemas/create-destination.schema";
import type { UpdateDestinationFormValues } from "../schemas/update-destination.schema";

interface DeleteDestinationResponse {
  readonly id: string;
}

export const destinationApi = Object.freeze({
  list: async (
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<Destination>> => {
    const response = await apiClient.get<PaginatedResponse<Destination>>(
      API_ENDPOINTS.destination.list,
      { params: { page, limit } },
    );
    return response.data;
  },

  detail: async (id: string): Promise<Destination> => {
    const response = await apiClient.get<Destination>(
      API_ENDPOINTS.destination.detail(id),
    );
    return response.data;
  },

  create: async (values: CreateDestinationFormValues): Promise<Destination> => {
    const response = await apiClient.post<Destination>(
      API_ENDPOINTS.destination.create,
      values,
    );
    return response.data;
  },

  update: async (
    id: string,
    values: UpdateDestinationFormValues,
  ): Promise<Destination> => {
    const response = await apiClient.patch<Destination>(
      API_ENDPOINTS.destination.update(id),
      values,
    );
    return response.data;
  },

  remove: async (id: string): Promise<DeleteDestinationResponse> => {
    const response = await apiClient.delete<DeleteDestinationResponse>(
      API_ENDPOINTS.destination.remove(id),
    );
    return response.data;
  },
});