import { Chip } from "@/shared/components/ui/chip";
import { ChipButton } from "@/shared/components/ui/button";
import { KgValue } from "@/shared/components/data/kg-value";
import { APPEND_TYPE_SPECS, type UiAppendType } from "@/features/ledger/ledger-append";
import { FLOW_LABELS } from "@/shared/constants/flow.constant";
import { formatDuration } from "@/shared/lib/format";
import type { DispositionQueueItem } from "@/shared/types/disposition.types";

const PRIMARY_ACTION: Readonly<Record<string, UiAppendType>> = Object.freeze({
  DIANGKUT: "DITERIMA",
  DITERIMA: "DIOLAH",
  DIOLAH: "KELUARAN"
});

export interface IncomingBatchRowProps {
  readonly item: DispositionQueueItem;
  readonly onAct: (item: DispositionQueueItem, tipe: UiAppendType) => void;
}

export function IncomingBatchRow({ item, onAct }: IncomingBatchRowProps) {
  const actionType = PRIMARY_ACTION[item.status];
  const spec = actionType === undefined ? null : APPEND_TYPE_SPECS[actionType];

  return (
    <div className="flex items-start justify-between gap-3 border-b border-garis py-3 last:border-b-0">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base text-ink">{FLOW_LABELS[item.aliran]}</span>
          {item.tier === null ? null : <Chip className="h-6">{item.tier}</Chip>}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-lemah">
          <KgValue value={item.weightKg} className="text-sm text-ink" />
          <span>umur {formatDuration(item.ageHours * 3_600_000)}</span>
        </div>
      </div>
      {spec === null ? null : (
        <ChipButton className="pointer-coarse:h-11 pointer-coarse:px-4" onClick={() => onAct(item, spec.tipe)}>
          {spec.verb}
        </ChipButton>
      )}
    </div>
  );
}