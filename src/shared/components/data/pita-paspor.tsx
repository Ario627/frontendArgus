import { Fragment } from "react";
import { HashTag } from "@/shared/components/data/hash-tag";
import { LEDGER_EVENT_LABELS } from "@/shared/constants/ledger.constant";
import { cn } from "@/shared/lib/cn";
import { formatKgValue, formatTime } from "@/shared/lib/format";
import type {
  ChainIssueReport,
  LedgerEventDto,
  TransferEvaluation
} from "@/shared/types/ledger.types";

export type PitaVariant = "console" | "field";

interface PitaSegment {
  readonly key: string;
  readonly label: string;
  readonly time: string;
  readonly weightKg: number | null;
  readonly pairKg: { readonly outKg: number | null; readonly inKg: number | null } | null;
  readonly witnessOk: boolean | null;
  readonly hash: string;
  readonly anomaly: boolean;
}

function buildSegments(
  events: readonly LedgerEventDto[],
  transfer: TransferEvaluation | null,
  chainIssue: ChainIssueReport | null
): readonly PitaSegment[] {
  const segments: PitaSegment[] = [];
  let transferSeen = false;
  for (const event of events) {
    const anomaly = chainIssue !== null && chainIssue.eventId === String(event.id);
    if (event.type === "SERAH_TERIMA") {
      if (transferSeen) continue;
      transferSeen = true;
      segments.push({
        key: `e${event.id}`,
        label: LEDGER_EVENT_LABELS.SERAH_TERIMA,
        time: formatTime(event.occurredAt),
        weightKg: event.weightKg,
        pairKg:
          transfer === null ? null : { outKg: transfer.senderKg, inKg: transfer.receiverKg },
        witnessOk:
          transfer === null || transfer.status === null ? null : transfer.status === "SAH",
        hash: event.hash,
        anomaly
      });
      continue;
    }
    segments.push({
      key: `e${event.id}`,
      label: LEDGER_EVENT_LABELS[event.type],
      time: formatTime(event.occurredAt),
      weightKg: event.weightKg,
      pairKg: null,
      witnessOk: null,
      hash: event.hash,
      anomaly
    });
  }
  return segments;
}

function formatPair(pair: NonNullable<PitaSegment["pairKg"]>): string {
  const out = pair.outKg === null ? "—" : formatKgValue(pair.outKg);
  const inKg = pair.inKg === null ? "—" : formatKgValue(pair.inKg);
  return `${out} ↔ ${inKg} kg`;
}

interface SegmentProps {
  readonly segment: PitaSegment;
  readonly ongoing: boolean;
  readonly variant: PitaVariant;
}

function Segment({ segment, ongoing, variant }: SegmentProps) {
  const sealed = !ongoing;
  return (
    <li
      className={cn(
        "relative flex shrink-0 snap-start flex-col gap-1 rounded-kontrol px-3 py-2",
        variant === "field" ? "min-w-36" : "min-w-32",
        sealed
          ? "bg-ink text-kertas"
          : "border border-dashed border-ink-lemah bg-kertas text-ink",
        segment.anomaly && "border-b-2 border-bata"
      )}
    >
      {segment.anomaly ? (
        <span className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full bg-bata font-mono text-2xs text-kertas">
          <span aria-hidden>!</span>
          <span className="sr-only">Anomali pada peristiwa ini</span>
        </span>
      ) : null}
      <span className={cn("label-cap", sealed ? "text-kertas/60" : "text-ink-lemah")}>
        {segment.label}
      </span>
      <span className="font-mono text-xs tabular-nums">{segment.time}</span>
      <span className="font-mono text-xs tabular-nums">
        {segment.pairKg !== null
          ? formatPair(segment.pairKg)
          : segment.weightKg === null
            ? "—"
            : `${formatKgValue(segment.weightKg)} kg`}
      </span>
      {segment.witnessOk === null ? null : (
        <span className={cn("text-2xs", sealed ? "text-kertas/70" : "text-ink-lemah")}>
          {segment.witnessOk ? "✓ saksi lengkap" : "menunggu saksi"}
        </span>
      )}
      <HashTag hash={segment.hash} tone={sealed ? "dark" : "light"} className="mt-0.5 self-start" />
    </li>
  );
}

export interface PitaPasporProps {
  readonly events: readonly LedgerEventDto[];
  readonly transfer?: TransferEvaluation | null;
  readonly chainIssue?: ChainIssueReport | null;
  readonly ongoing?: boolean;
  readonly variant?: PitaVariant;
  readonly className?: string;
}

export function PitaPaspor({
  events,
  transfer = null,
  chainIssue = null,
  ongoing = false,
  variant = "console",
  className
}: PitaPasporProps) {
  const segments = buildSegments(events, transfer, chainIssue);
  if (segments.length === 0) {
    return <p className="text-sm text-ink-lemah">Belum ada peristiwa tercatat.</p>;
  }
  const lastIndex = segments.length - 1;
  return (
    <ol
      aria-label="Pita paspor"
      className={cn("flex snap-x items-stretch overflow-x-auto pb-1", className)}
    >
      {segments.map((segment, index) => (
        <Fragment key={segment.key}>
          {index > 0 ? (
            <span aria-hidden className="mx-1.5 w-3 shrink-0 self-center border-t border-ink-lemah/50" />
          ) : null}
          <Segment segment={segment} ongoing={ongoing && index === lastIndex} variant={variant} />
        </Fragment>
      ))}
    </ol>
  );
}