import type { ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface SheetProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title: string;
  readonly description: string;
  readonly footer?: ReactNode;
  readonly children: ReactNode;
}

export function Sheet({ open, onOpenChange, title, description, footer, children }: SheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        <DialogContent
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-kontainer border border-garis bg-kertas shadow-float outline-none",
            "md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-104 md:rounded-tl-kontainer md:rounded-tr-none md:rounded-bl-kontainer",
            "data-[state=open]:animate-rise md:data-[state=open]:animate-slide-in-right",
            "data-[state=closed]:animate-fall md:data-[state=closed]:animate-slide-out-right"
          )}
        >
          <header className="flex items-start justify-between gap-4 border-b border-garis px-4 py-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <DialogTitle className="text-md font-semibold text-ink">{title}</DialogTitle>
              <DialogDescription className="text-sm text-ink-lemah">
                {description}
              </DialogDescription>
            </div>
            <DialogClose
              aria-label="Tutup"
              className="-mt-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-kontrol text-ink-lemah transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <X aria-hidden strokeWidth={1.75} className="size-5" />
            </DialogClose>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            {children}
          </div>
          {footer === undefined ? null : (
            <footer className="border-t border-garis px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {footer}
            </footer>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}