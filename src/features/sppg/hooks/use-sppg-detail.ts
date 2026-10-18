import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchSppgDetail } from "@/features/sppg/api/sppg.api";

export function useSppgDetail(sppgId: string | null, enabled = true) {
  return useQuery({
    queryKey: qk.sppg.detail(sppgId ?? "kosong"),
    queryFn: () => fetchSppgDetail(sppgId ?? ""),
    enabled: sppgId !== null && enabled,
    staleTime: 30_000
  });
}
