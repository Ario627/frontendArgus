import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchPublicStruk } from "@/features/public-receipt/api/struk.api";
import { isStrukToken } from "@/shared/types/struk.types";

export function usePublicStruk(token: string) {
  return useQuery({
    queryKey: qk.publicStruk(token),
    queryFn: () => fetchPublicStruk(token),
    enabled: isStrukToken(token),
    staleTime: 5 * 60 * 1000,
    retry: false
  });
}