import { GATE_TONES, type GateStatus } from "@/shared/constants/gate.constant";
import type { StatusTone } from "@/shared/constants/tone.constant";
import { cn } from "@/shared/lib/cn";

const TONE_CLASSES: Readonly<Record<StatusTone, string>> = Object.freeze({
  daun: "border-daun text-daun",
  kunyit: "border-kunyit text-kunyit",
  "biru-tinta": "border-biru-tinta text-biru-tinta",
  bata: "border-bata text-bata",
  netral: "border-ink-lemah text-ink-lemah"
});

export interface StampProps {
  readonly verdict: GateStatus;
  readonly tilt?: boolean;
  readonly className?: string;
}

export function Stamp({ verdict, tilt = false, className }: StampProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-kontrol border-[1.5px] px-2 py-1 font-mono text-2xs tracking-label uppercase",
        TONE_CLASSES[GATE_TONES[verdict]],
        tilt && "-rotate-1",
        className
      )}
    >
      {verdict}
    </span>
  );
}