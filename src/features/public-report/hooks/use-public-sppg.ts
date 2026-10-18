import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchPublicSppg } from "@/features/public-report/api/public-report.api";
import { SPPG_SLUG_PATTERN } from "@/features/public-report/report-validation";

export function usePublicSppg(slug: string) {
  const valid = SPPG_SLUG_PATTERN.test(slug);
  return useQuery({
    queryKey: qk.publicSppg(slug),
    queryFn: () => fetchPublicSppg(slug),
    enabled: valid,
    staleTime: 30 * 60 * 1000,
    retry: false
  });
}