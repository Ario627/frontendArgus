import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface FieldActionBarProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function FieldActionBar({ children, className }: FieldActionBarProps) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-garis bg-kertas px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className
      )}
    >
      {children}
    </div>
  );
}