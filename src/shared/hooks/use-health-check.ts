import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api/axios-client";
import { queryKeys } from "../../api/query-keys";
import { POLLING_INTERVALS } from "../constants/polling.constant";
import type { HealthResponse } from "../types/common.types";

export function useHealthCheck() {
  return useQuery<HealthResponse>({
    queryKey: queryKeys.health,
    queryFn: async () => {
      const response = await apiClient.get<HealthResponse>("/health");
      return response.data as unknown as HealthResponse;
    },
    refetchInterval: POLLING_INTERVALS.health,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}