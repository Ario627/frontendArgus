import {
  ArrowUp,
  CornerDownLeft,
  CornerDownRight,
  Flag,
  MoveUp,
  Navigation,
  RotateCcw,
  Undo2
} from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface ManeuverArrowProps {
  readonly maneuverType: string | null;
  readonly maneuverModifier: string | null;
  readonly bearingDeg: number;
  readonly className?: string;
}

const ArrowIcon = {
  depart: Navigation,
  straight: ArrowUp,
  left: CornerDownLeft,
  right: CornerDownRight,
  slightLeft: MoveUp,
  slightRight: MoveUp,
  uturn: Undo2,
  arrive: Flag,
  fallback: RotateCcw
} as const;

export function ManeuverArrow({
  maneuverType,
  maneuverModifier,
  bearingDeg,
  className
}: ManeuverArrowProps) {
  const modifier = maneuverModifier ?? "";
  let key: keyof typeof ArrowIcon = "fallback";
  let rotation = 0;
  let flip = false;

  if (maneuverType === "depart") {
    key = "depart";
    rotation = bearingDeg;
  } else if (maneuverType === "arrive") {
    key = "arrive";
  } else if (modifier.startsWith("sharp left")) {
    key = "left";
  } else if (modifier.startsWith("sharp right")) {
    key = "right";
  } else if (modifier.startsWith("left")) {
    key = "left";
  } else if (modifier.startsWith("right")) {
    key = "right";
  } else if (modifier.startsWith("slight left")) {
    key = "slightLeft";
    flip = true;
  } else if (modifier.startsWith("slight right")) {
    key = "slightRight";
  } else if (modifier.startsWith("uturn")) {
    key = "uturn";
  } else if (modifier === "straight") {
    key = "straight";
  }

  const Icon = ArrowIcon[key];

  return (
    <span
      aria-hidden
      className={cn("grid place-items-center text-biru-tinta", className)}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <Icon
        strokeWidth={1.75}
        className={cn("size-7", flip && "-scale-x-100")}
      />
    </span>
  );
}
