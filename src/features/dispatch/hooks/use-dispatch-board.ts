import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchDispatchBoard } from "@/features/dispatch/api/dispatch.api";
import { env } from "@/shared/lib/env";

export function useDispatchBoard(sppgId: string | null, enabled = true) {
  return useQuery({
    queryKey: qk.dispatch.board(sppgId),
    queryFn: () => fetchDispatchBoard(sppgId),
    enabled,
    staleTime: 10_000,
    refetchInterval: env.VITE_POLL_OPERATIONAL_MS,
    retry: 1
  });
}
