import { useQuery } from "@tanstack/react-query";
import { isApiError } from "@/api/api-error";
import { qk } from "@/api/query-keys";
import { fetchPhotoLink } from "@/features/photo/api/photo.api";

const LINK_STALE_MS = 60_000;
const RETRYABLE_MAX = 2;

export function usePhotoLink(sha256: string | null, enabled = true) {
  return useQuery({
    queryKey: qk.photos.link(sha256 ?? "kosong"),
    queryFn: () => fetchPhotoLink(sha256 ?? ""),
    enabled: sha256 !== null && enabled,
    staleTime: LINK_STALE_MS,
    retry: (count, error) => {
      if (isApiError(error) && (error.status === 403 || error.status === 404)) return false;
      return count < RETRYABLE_MAX;
    }
  });
}
