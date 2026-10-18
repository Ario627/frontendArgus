import { useQuery } from "@tanstack/react-query";
import { fetchSppgPoints } from "@/features/menu/api/menu.api";

const REFERENCE_STALE_MS = 30 * 60 * 1000;

export function useObservationPoints(sppgId: string | null) {
  return useQuery({
    queryKey: ["sppg", "points", sppgId ?? "kosong"],
    queryFn: () => fetchSppgPoints(sppgId ?? ""),
    enabled: sppgId !== null,
    staleTime: REFERENCE_STALE_MS,
    select: (detail) => detail.points
  });
}