import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchParameters } from "@/features/parameters/api/parameters.api";

const REFERENCE_STALE_MS = 30 * 60 * 1000;

export function useParameters() {
  return useQuery({
    queryKey: qk.parameters,
    queryFn: fetchParameters,
    staleTime: REFERENCE_STALE_MS
  });
}