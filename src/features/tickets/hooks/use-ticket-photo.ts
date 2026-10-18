import { useQuery } from "@tanstack/react-query";
import { fetchPhotoLink } from "@/features/tickets/api/tickets.api";

const PRESIGNED_STALE_MS = 10 * 60 * 1000;

export function useTicketPhoto(sha256: string | null) {
  return useQuery({
    queryKey: ["photos", sha256 ?? "kosong"],
    queryFn: () => fetchPhotoLink(sha256 ?? ""),
    enabled: sha256 !== null,
    staleTime: PRESIGNED_STALE_MS
  });
}