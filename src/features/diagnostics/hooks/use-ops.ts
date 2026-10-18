import { useMutation, useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import type { ChainSweepReport, HealthReport, RetentionRunReport } from "@/shared/types/ops.types";

const HEALTH_POLL_MS = 30_000;

export function fetchHealth(): Promise<HealthReport> {
  return apiGet<HealthReport>(endpoints.health, { validateStatus: () => true });
}

export function fetchChainVerify(): Promise<ChainSweepReport> {
  return apiPost<ChainSweepReport>(endpoints.chain.verify);
}

export function fetchRetentionRun(): Promise<RetentionRunReport> {
  return apiPost<RetentionRunReport>(endpoints.retention.run);
}

export function useHealth(enabled = true) {
  return useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    enabled,
    staleTime: 10_000,
    refetchInterval: HEALTH_POLL_MS
  });
}

export function useChainVerify() {
  return useMutation({ mutationFn: fetchChainVerify });
}

export function useRetentionRun() {
  return useMutation({ mutationFn: fetchRetentionRun });
}
