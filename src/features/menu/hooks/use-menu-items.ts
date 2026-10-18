import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchMenuItems } from "@/features/menu/api/menu.api";

const REFERENCE_STALE_MS = 30 * 60 * 1000;

export function useMenuItems(aktif = true) {
  return useQuery({
    queryKey: qk.menu.items({ aktif, limit: 100 }),
    queryFn: () => fetchMenuItems({ aktif, limit: 100 }),
    staleTime: REFERENCE_STALE_MS
  });
}