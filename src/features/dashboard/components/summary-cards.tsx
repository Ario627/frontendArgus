import { cn } from "../../../lib/cn";
import { Skeleton } from "../../../shared/components/ui/skeleton";
import { useDelayedLoading } from "../../../shared/hooks/use-delayed-loading";
import type { DashboardSummary } from "../../../shared/types/dashboard.types";
import {
  TruckIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ClockIcon,
  WifiOffIcon,
  WrenchIcon,
  TrendingUpIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SummaryCardsProps {
  summary: DashboardSummary | undefined;
  isLoading: boolean;
  isError: boolean;
  className?: string;
}

interface CardData {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone: "neutral" | "success" | "warning" | "danger" | "brand";
  accentLabel?: string;
}

const TONE_STYLES = {
  neutral: {
    iconBg: "bg-muted",
    icon: "text-muted-foreground",
    value: "text-foreground",
    indicator: "bg-muted-foreground",
  },
  success: {
    iconBg: "bg-success/10",
    icon: "text-success",
    value: "text-foreground",
    indicator: "bg-success",
  },
  warning: {
    iconBg: "bg-warning/10",
    icon: "text-warning",
    value: "text-foreground",
    indicator: "bg-warning",
  },
  danger: {
    iconBg: "bg-destructive/10",
    icon: "text-destructive",
    value: "text-foreground",
    indicator: "bg-destructive",
  },
  brand: {
    iconBg: "bg-brand/10",
    icon: "text-brand",
    value: "text-foreground",
    indicator: "bg-brand",
  },
} as const;

function getCards(summary: DashboardSummary): CardData[] {
  return [
    {
      label: "Total Armada",
      value: summary.totalFleet,
      icon: TruckIcon,
      tone: "neutral",
      accentLabel: "terdaftar",
    },
    {
      label: "Online Normal",
      value: summary.onlineNormal,
      icon: CheckCircleIcon,
      tone: "success",
    },
    {
      label: "Online Rusak",
      value: summary.onlineBroken,
      icon: WrenchIcon,
      tone: "danger",
    },
    {
      label: "Stale",
      value: summary.stale,
      icon: ClockIcon,
      tone: "warning",
    },
    {
      label: "Offline",
      value: summary.offline,
      icon: WifiOffIcon,
      tone: "neutral",
    },
    {
      label: "Recovery Hari Ini",
      value: summary.recoveryCountToday,
      icon: AlertCircleIcon,
      tone: "brand",
    },
    {
      label: "Efisiensi Rute",
      value: `${(summary.avgRouteEfficiency * 100).toFixed(1)}%`,
      icon: TrendingUpIcon,
      tone: "brand",
      accentLabel: "rata-rata",
    },
  ];
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
  accentLabel,
}: CardData) {
  const styles = TONE_STYLES[tone];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-border/80 hover:shadow-md",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                styles.iconBg,
              )}
              aria-hidden
            >
              <Icon className={cn("h-4 w-4", styles.icon)} />
            </span>
            {accentLabel && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {accentLabel}
              </span>
            )}
          </div>
          <div>
            <p
              className={cn(
                "text-2xl font-semibold tracking-tight tabular-nums",
                styles.value,
              )}
            >
              {value}
            </p>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              {label}
            </p>
          </div>
        </div>
        <span
          className={cn("h-2 w-2 rounded-full ring-2 ring-card", styles.indicator)}
          aria-hidden
        />
      </div>
      <div
        className={cn(
          "absolute -bottom-6 -right-6 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-40",
          styles.iconBg.replace("/10", "/30"),
        )}
        aria-hidden
      />
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
      aria-hidden
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="mt-2 h-3.5 w-24" />
          </div>
        </div>
        <Skeleton className="h-2 w-2 rounded-full" />
      </div>
    </div>
  );
}

export function SummaryCards({
  summary,
  isLoading,
  isError,
  className,
}: SummaryCardsProps) {
  const showSkeleton = useDelayedLoading(isLoading);

  if (showSkeleton) {
    return (
      <div
        className={cn(
          "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7",
          className,
        )}
        aria-busy="true"
        aria-live="polite"
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <SummarySkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div
        className={cn(
          "flex flex-col items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-5",
          className,
        )}
        role="status"
      >
        <p className="text-sm font-medium text-foreground">
          {isError ? "Gagal memuat ringkasan" : "Data ringkasan tidak tersedia"}
        </p>
        <p className="text-xs text-muted-foreground">
          Coba muat ulang halaman atau hubungi administrator jika masalah berlanjut.
        </p>
      </div>
    );
  }

  const cards = getCards(summary);

  return (
    <div
      className={cn(
        "stagger-children grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7",
        className,
      )}
      role="list"
      aria-label="Metrik operasional"
    >
      {cards.map((card) => (
        <div key={card.label} role="listitem">
          <SummaryCard {...card} />
        </div>
      ))}
    </div>
  );
}
