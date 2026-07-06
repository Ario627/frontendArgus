import { useQuery } from "@tanstack/react-query";
import { destinationApi } from "../api/destination.api";
import { queryKeys } from "../../../api/query-keys";

export function useDestinationDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.destination.detail(id ?? ""),
    queryFn: () => destinationApi.detail(id as string),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
