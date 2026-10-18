import { useEffect, useState } from "react";

const DEFAULT_DELAY_MS = 300;

export function useDelayedLoading(active: boolean, delayMs: number = DEFAULT_DELAY_MS): boolean {
  const [visible, setVisible] = useState(false);
  const [previousActive, setPreviousActive] = useState(active);

  if (active !== previousActive) {
    setPreviousActive(active);
    setVisible(false);
  }

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [active, delayMs]);

  return active && visible;
}