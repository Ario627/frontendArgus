import { Button } from "@/shared/components/ui/button";
import { Select } from "@/shared/components/ui/select";
import { BATCH_STATUSES, BATCH_STATUS_LABELS } from "@/shared/constants/batch.constant";
import { FLOW_LABELS, WASTE_FLOWS } from "@/shared/constants/flow.constant";
import { DISPOSITION_TIERS, TIER_LABELS } from "@/shared/constants/tier.constant";
import type { BatchFilterState } from "@/features/batch/hooks/use-batches";

export function readBatchFilters(params: URLSearchParams): BatchFilterState {
  const status = params.get("status") ?? "";
  const tier = params.get("tier") ?? "";
  const aliran = params.get("aliran") ?? "";
  return {
    ...(BATCH_STATUSES.includes(status as (typeof BATCH_STATUSES)[number])
      ? { status: status as (typeof BATCH_STATUSES)[number] }
      : {}),
    ...(DISPOSITION_TIERS.includes(tier as (typeof DISPOSITION_TIERS)[number])
      ? { tier: tier as (typeof DISPOSITION_TIERS)[number] }
      : {}),
    ...(WASTE_FLOWS.includes(aliran as (typeof WASTE_FLOWS)[number])
      ? { aliran: aliran as (typeof WASTE_FLOWS)[number] }
      : {})
  };
}

export function writeBatchFilters(filters: BatchFilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.status !== undefined) params.set("status", filters.status);
  if (filters.tier !== undefined) params.set("tier", filters.tier);
  if (filters.aliran !== undefined) params.set("aliran", filters.aliran);
  return params;
}

export interface BatchFilterBarProps {
  readonly filters: BatchFilterState;
  readonly onChange: (next: BatchFilterState) => void;
}

export function BatchFilterBar({ filters, onChange }: BatchFilterBarProps) {
  const hasFilters =
    filters.status !== undefined || filters.tier !== undefined || filters.aliran !== undefined;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1">
        <span className="label-cap text-ink-lemah">Status</span>
        <Select
          value={filters.status ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              status: event.target.value === "" ? undefined : (event.target.value as BatchStatus)
            })
          }
          className="w-44"
        >
          <option value="">Semua</option>
          {BATCH_STATUSES.map((status) => (
            <option key={status} value={status}>
              {BATCH_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="label-cap text-ink-lemah">Tingkat</span>
        <Select
          value={filters.tier ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              tier: event.target.value === "" ? undefined : (event.target.value as DispositionTier)
            })
          }
          className="w-40"
        >
          <option value="">Semua</option>
          {DISPOSITION_TIERS.map((tier) => (
            <option key={tier} value={tier}>
              {tier} · {TIER_LABELS[tier]}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="label-cap text-ink-lemah">Aliran</span>
        <Select
          value={filters.aliran ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              aliran: event.target.value === "" ? undefined : (event.target.value as WasteFlow)
            })
          }
          className="w-36"
        >
          <option value="">Semua</option>
          {WASTE_FLOWS.map((flow) => (
            <option key={flow} value={flow}>
              {FLOW_LABELS[flow]}
            </option>
          ))}
        </Select>
      </label>
      {hasFilters ? (
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>
          Hapus filter
        </Button>
      ) : null}
    </div>
  );
}