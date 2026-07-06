import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../api/query-keys";
import { fleetApi } from "../api/fleet.api";

interface UseFleetListOptions {
  readonly page?: number;
  readonly limit?: number;
}

export function useFleetList({
  page = 1,
  limit = 20,
}: UseFleetListOptions = {}) {
  return useQuery({
    queryKey: [...queryKeys.fleet.list(), { page, limit }],
    queryFn: () => fleetApi.list(page, limit),
    staleTime: 30_000,
  });
}

