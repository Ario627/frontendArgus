import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchSppgList } from "@/features/sppg/api/sppg.api";

const REFERENCE_STALE_MS = 30 * 60 * 1000;

export function useSppgList(aktif = true) {
  return useQuery({
    queryKey: qk.sppg.list({ aktif, limit: 100 }),
    queryFn: () => fetchSppgList({ aktif, limit: 100 }),
    staleTime: REFERENCE_STALE_MS
  });
}