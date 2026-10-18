import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchScalePending, type ScalePendingQuery } from "@/features/scale/api/scale.api";

const LIST_LIMIT = 50;

export function useScalePending(enabled = true) {
  const query: Omit<ScalePendingQuery, "page" | "limit"> = {};

  return useQuery({
    queryKey: qk.scale.pendingList(query),
    queryFn: () => fetchScalePending({ ...query, limit: LIST_LIMIT }),
    staleTime: 10_000,
    refetchInterval: 30_000,
    enabled
  });
}
