import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";
import { cn } from "@/shared/lib/cn";

export interface BreadcrumbEntry {
  readonly label: string;
  readonly to?: string;
}

export interface PageHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly breadcrumb?: readonly BreadcrumbEntry[];
  readonly actions?: ReactNode;
  readonly className?: string;
}

export function PageHeader({ title, description, breadcrumb, actions, className }: PageHeaderProps) {
  const crumbs = breadcrumb ?? [];

  return (
    <header className={cn("flex flex-col gap-2", className)}>
      {crumbs.length === 0 ? null : (
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-ink-lemah">
          {crumbs.map((entry, index) => (
            <Fragment key={`${entry.label}-${index}`}>
              {index > 0 ? <span aria-hidden>/</span> : null}
              {entry.to === undefined ? (
                <span>{entry.label}</span>
              ) : (
                <Link to={entry.to} className="transition-colors hover:text-ink">
                  {entry.label}
                </Link>
              )}
            </Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-ink">{title}</h1>
        {actions === undefined ? null : (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
      {description === undefined ? null : (
        <p className="max-w-prose text-sm text-ink-lemah">{description}</p>
      )}
    </header>
  );
}