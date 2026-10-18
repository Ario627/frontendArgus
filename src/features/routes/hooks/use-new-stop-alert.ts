import { useCallback, useEffect, useMemo, useState } from "react";
import { isStopClosed } from "@/features/routes/route-labels";
import type { RouteStopDto } from "@/shared/types/route.types";

const SNAPSHOT_PREFIX = "argus.driver.stops.";

const snapshotOf = (stops: readonly RouteStopDto[]): readonly string[] =>
  stops.map((stop) => `${stop.id}:${stop.status}:${stop.urutan}`);

const readSnapshot = (key: string): readonly string[] | null => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === "string") : null;
  } catch {
    return null;
  }
};

const writeSnapshot = (key: string, value: readonly string[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
};

export interface NewStopAlert {
  readonly newCount: number;
  readonly acknowledge: () => void;
}

export function useNewStopAlert(planId: string | null, stops: readonly RouteStopDto[]): NewStopAlert {
  const [version, setVersion] = useState(0);
  const snapshot = useMemo(() => snapshotOf(stops), [stops]);
  const key = planId === null ? null : `${SNAPSHOT_PREFIX}${planId}`;

  useEffect(() => {
    if (key === null || snapshot.length === 0) return;
    if (readSnapshot(key) === null) writeSnapshot(key, snapshot);
  }, [key, snapshot]);

  const newCount = useMemo(() => {
    if (key === null || snapshot.length === 0) return 0;
    void version;
    const stored = readSnapshot(key);
    if (stored === null) return 0;
    const seen = new Set(stored);
    return snapshot.filter((entry) => !seen.has(entry)).length;
  }, [key, snapshot, version]);

  const acknowledge = useCallback(() => {
    if (key === null) return;
    writeSnapshot(key, snapshotOf(stops));
    setVersion((current) => current + 1);
  }, [key, stops]);

  const openStops = stops.filter((stop) => !isStopClosed(stop.status)).length;

  return { newCount: openStops === 0 ? 0 : newCount, acknowledge };
}
