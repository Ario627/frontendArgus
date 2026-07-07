import { useCallback, useState } from "react";

type DashboardCardId = "metrics" | "narrative";

interface DashboardLayoutState {
  visibleCards: Record<DashboardCardId, boolean>;
  toggleCard: (id: DashboardCardId) => void;
  addCard: (id: DashboardCardId) => void;
  removeCard: (id: DashboardCardId) => void;
}

const STORAGE_KEY = "argus:dashboard-layout";

function readInitial(): Record<DashboardCardId, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      return {
        metrics: parsed.metrics ?? true,
        narrative: parsed.narrative ?? true,
      };
    }
  } catch {
    // ignore
  }
  return { metrics: true, narrative: true };
}

export function useDashboardLayout(): DashboardLayoutState {
  const [visibleCards, setVisibleCards] =
    useState<Record<DashboardCardId, boolean>>(readInitial);

  const persist = useCallback((next: Record<DashboardCardId, boolean>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const toggleCard = useCallback(
    (id: DashboardCardId) => {
      setVisibleCards((prev) => {
        const next = { ...prev, [id]: !prev[id] };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const addCard = useCallback(
    (id: DashboardCardId) => {
      setVisibleCards((prev) => {
        if (prev[id]) return prev;
        const next = { ...prev, [id]: true };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const removeCard = useCallback(
    (id: DashboardCardId) => {
      setVisibleCards((prev) => {
        if (!prev[id]) return prev;
        const next = { ...prev, [id]: false };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  return { visibleCards, toggleCard, addCard, removeCard };
}
