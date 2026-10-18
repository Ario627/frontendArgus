import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchMenuServings, type MenuServingsQuery } from "@/features/menu/api/menu.api";

export function useMenuServings(query: MenuServingsQuery, enabled = true) {
  return useQuery({
    queryKey: qk.menu.servings(query),
    queryFn: () => fetchMenuServings(query),
    enabled,
    staleTime: 30_000
  });
}
