import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../api/query-keys";
import { destinationApi } from "../../destination/api/destination.api";
import type { DestinationMapItem } from "../../../shared/types/destination.types";

export function useDestinationMap() {
  return useQuery<DestinationMapItem[]>({
    queryKey: queryKeys.destination.map,
    queryFn: destinationApi.map,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
