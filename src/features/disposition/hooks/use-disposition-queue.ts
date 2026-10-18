import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchDispositionQueue } from "@/features/disposition/api/disposition.api";
import { env } from "@/shared/lib/env";

export function useDispositionQueue(date: string, sppgId: string | null) {
  const query = sppgId === null ? { date } : { date, sppgId };

  return useQuery({
    queryKey: qk.dispositions(query),
    queryFn: () => fetchDispositionQueue(query),
    staleTime: 30_000,
    refetchInterval: env.VITE_POLL_OPERATIONAL_MS
  });
}