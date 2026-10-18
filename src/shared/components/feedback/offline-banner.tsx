import { cn } from "@/shared/lib/cn";
import { useOnline } from "@/shared/hooks/use-online";

export interface OfflineBannerProps {
  readonly pendingCount?: number;
  readonly className?: string;
}

export function OfflineBanner({ pendingCount = 0, className }: OfflineBannerProps) {
  const online = useOnline();
  if (online) return null;

  return (
    <div
      role="status"
      className={cn(
        "border-b border-kunyit/40 bg-kunyit/10 px-4 py-2 text-sm text-kunyit",
        className
      )}
    >
      Offline — catatan aman di perangkat
      {pendingCount > 0 ? ` (${pendingCount} menunggu)` : ""}
    </div>
  );
}