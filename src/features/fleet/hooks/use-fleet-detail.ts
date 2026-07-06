import { useQuery } from "@tanstack/react-query";
import { fleetApi } from "../api/fleet.api";
import { queryKeys } from "../../../api/query-keys";

export function useFleetDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.fleet.detail(id ?? ""),
    queryFn: () => fleetApi.detail(id as string),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
