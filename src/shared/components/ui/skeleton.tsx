import { cn } from "@/shared/lib/cn";

export interface SkeletonProps {
  readonly className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden className={cn("animate-pulse rounded-kontrol bg-garis", className)} />;
}

export interface SkeletonListProps {
  readonly rows?: number;
  readonly rowClassName?: string;
  readonly className?: string;
}

export function SkeletonList({ rows = 5, rowClassName, className }: SkeletonListProps) {
  return (
    <div role="status" aria-label="Memuat" className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className={cn("h-11 w-full", rowClassName)} />
      ))}
    </div>
  );
}