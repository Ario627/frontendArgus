import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToastStore, type ToastMessage } from "@/shared/components/ui/toast-store";

const EXIT_DURATION_MS = 140;

export function ToastViewport() {
  const current = useToastStore((state) => state.current);
  const dismiss = useToastStore((state) => state.dismiss);
  const [rendered, setRendered] = useState<ToastMessage | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (current !== null) {
      setRendered(current);
      setLeaving(false);
      return;
    }
    if (rendered === null) return;
    setLeaving(true);
    const timer = setTimeout(() => {
      setRendered(null);
      setLeaving(false);
    }, EXIT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [current, rendered]);

  if (rendered === null) return null;

  const action = rendered.action;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div
        key={rendered.id}
        role="status"
        className={cn(
          "pointer-events-auto flex max-w-md items-center gap-3 rounded-kontainer px-4 py-2.5 text-sm text-kertas shadow-float",
          rendered.tone === "bata" ? "bg-bata" : "bg-ink",
          leaving ? "animate-fade-out" : "animate-scale-in"
        )}
      >
        <span className="min-w-0">{rendered.message}</span>
        {action === undefined ? null : (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              dismiss();
            }}
            className="shrink-0 font-medium underline underline-offset-2"
          >
            {action.label}
          </button>
        )}
        <button
          type="button"
          aria-label="Tutup"
          onClick={dismiss}
          className="-mr-1.5 grid size-8 shrink-0 place-items-center rounded-kontrol transition-colors hover:bg-kertas/15"
        >
          <X aria-hidden strokeWidth={1.75} className="size-4" />
        </button>
      </div>
    </div>
  );
}