import { useQuery } from "@tanstack/react-query";
import { destinationApi } from "../api/destination.api";
import { queryKeys } from "../../../api/query-keys";

interface UseDestinationListOptions {
  readonly page?: number;
  readonly limit?: number;
}

export function useDestinationList({
  page = 1,
  limit = 20,
}: UseDestinationListOptions = {}) {
  return useQuery({
    queryKey: queryKeys.destination.list(),
    queryFn: () => destinationApi.list(page, limit),
    staleTime: 30_000,
  });
}