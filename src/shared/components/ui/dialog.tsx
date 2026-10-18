import { useEffect, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from "@radix-ui/react-dialog";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/components/ui/button";

export interface ConfirmDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title: string;
  readonly description: string;
  readonly confirmLabel: string;
  readonly cancelLabel?: string;
  readonly tone?: "netral" | "bahaya";
  readonly typedWord?: string;
  readonly pending?: boolean;
  readonly onConfirm: () => void;
  readonly children?: ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Batal",
  tone = "netral",
  typedWord,
  pending = false,
  onConfirm,
  children
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  const typedOk = typedWord === undefined || typed.trim().toUpperCase() === typedWord.toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        <DialogContent
          className={cn(
            "fixed inset-0 z-50 m-auto flex h-fit w-[calc(100%-2rem)] max-w-md flex-col gap-3 rounded-kontainer border border-garis bg-kertas p-5 shadow-float outline-none",
            "data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out"
          )}
        >
          <DialogTitle className="text-md font-semibold text-ink">{title}</DialogTitle>
          <DialogDescription className="text-sm text-ink-lemah">{description}</DialogDescription>
          {children === undefined ? null : <div className="text-sm text-ink">{children}</div>}
          {typedWord === undefined ? null : (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-ink">
                Ketik <span className="font-mono font-medium">{typedWord}</span> untuk konfirmasi
              </span>
              <input
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                autoComplete="off"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                className="h-11 w-full rounded-kontrol border border-garis bg-kertas px-3 font-mono text-base text-ink"
              />
            </label>
          )}
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" disabled={pending} onClick={() => onOpenChange(false)}>
              {cancelLabel}
            </Button>
            <Button
              variant={tone === "bahaya" ? "danger" : "primary"}
              loading={pending}
              disabled={!typedOk}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}