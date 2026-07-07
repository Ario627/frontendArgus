import { apiClient } from "../../../api/axios-client";
import { API_ENDPOINTS } from "../../../api/endpoints";
import type { DashboardSummary } from "../../../shared/types/dashboard.types";
import type { FleetPosition } from "../../../shared/types/fleet.types";
import type { PaginatedResponse } from "../../../shared/types/common.types";

export const dashboardApi = Object.freeze({
  getFleetPositions: async (): Promise<FleetPosition[]> => {
    const response = await apiClient.get<PaginatedResponse<FleetPosition>>(
      API_ENDPOINTS.dashboard.fleetPositions,
    );
    return [...response.data.data];
  },

  getSummary: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<DashboardSummary>(
      API_ENDPOINTS.dashboard.summary,
    );
    return response.data;
  },
});
