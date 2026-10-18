import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchMenuInsights } from "@/features/menu/api/menu.api";

export interface MenuInsightFilters {
  readonly sppgId: string | null;
  readonly from: string;
  readonly to: string;
}

export function useMenuInsights(filters: MenuInsightFilters) {
  const query =
    filters.sppgId === null
      ? { from: filters.from, to: filters.to }
      : { sppgId: filters.sppgId, from: filters.from, to: filters.to };

  return useQuery({
    queryKey: qk.menu.insights(query),
    queryFn: () => fetchMenuInsights(query),
    staleTime: 5 * 60 * 1000
  });
}