import { cn } from "@/shared/lib/cn";

export interface RulerTicksProps {
  readonly className?: string;
}

export function RulerTicks({ className }: RulerTicksProps) {
  return (
    <div aria-hidden className={cn("relative h-2", className)}>
      <div className="bg-ruler-minor absolute inset-x-0 bottom-0 h-1" />
      <div className="bg-ruler-major absolute inset-x-0 bottom-0 h-2" />
    </div>
  );
}
