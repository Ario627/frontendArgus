import { apiClient } from "../../../api/axios-client";
import { API_ENDPOINTS } from "../../../api/endpoints";
import type { OptimizationOutput } from "../../../shared/types/optimization.types";

export const optimizationApi = Object.freeze({
  triggerDailyPlan: async (): Promise<OptimizationOutput> => {
    const response = await apiClient.post<OptimizationOutput>(
      API_ENDPOINTS.optimization.triggerDailyPlan,
    );
    return response.data;
  },
});