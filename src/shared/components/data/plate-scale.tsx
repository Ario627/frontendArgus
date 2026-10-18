import { useId } from "react";
import type { LeftoverLevel } from "@/shared/constants/leftover.constant";

export interface PlateGlyphProps {
  readonly level: LeftoverLevel;
  readonly size: number;
}

export function PlateGlyph({ level, size }: PlateGlyphProps) {
  const clipId = `${useId()}-piring`;
  const radius = 10;
  const fillHeight = (level / 4) * radius * 2;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <circle cx="12" cy="12" r={radius} />
        </clipPath>
      </defs>
      <circle cx="12" cy="12" r={radius} fill="none" stroke="currentColor" strokeWidth="1.5" />
      {level === 0 ? null : (
        <rect
          x="2"
          y={22 - fillHeight}
          width="20"
          height={fillHeight}
          fill="currentColor"
          opacity="0.85"
          clipPath={`url(#${clipId})`}
        />
      )}
    </svg>
  );
}