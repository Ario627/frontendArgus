import type { ComponentPropsWithRef } from "react";
import { Link, type LinkProps } from "react-router";
import { cn } from "@/shared/lib/cn";
import { Spinner } from "@/shared/components/ui/spinner";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const BASE_CLASSES =
  "relative inline-flex select-none items-center justify-center rounded-kontrol font-medium whitespace-nowrap transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50";

const VARIANT_CLASSES: Readonly<Record<ButtonVariant, string>> = Object.freeze({
  primary:
    "bg-biru-tinta text-kertas hover:bg-[color-mix(in_oklab,var(--color-biru-tinta)_92%,var(--color-ink))]",
  secondary: "border border-garis bg-kertas text-ink hover:bg-[#EFEFED]",
  danger: "border border-bata bg-kertas text-bata hover:bg-bata/8",
  ghost: "text-ink hover:bg-ink/5"
});

const SIZE_CLASSES: Readonly<Record<ButtonSize, string>> = Object.freeze({
  sm: "h-9 gap-1.5 px-3 text-sm",
  md: "h-11 gap-2 px-4 text-sm",
  lg: "h-13 gap-2 px-5 text-md"
});

const SPINNER_OFFSET_CLASSES: Readonly<Record<ButtonSize, string>> = Object.freeze({
  sm: "left-2.5",
  md: "left-3",
  lg: "left-4"
});

export interface ButtonStyleOptions {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly fullWidth?: boolean;
  readonly className?: string;
}

function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className
}: ButtonStyleOptions): string {
  return cn(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], fullWidth && "w-full", className);
}

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly loading?: boolean;
  readonly fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled = false,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, fullWidth, className })}
    >
      {loading ? <Spinner size="sm" className={cn("absolute", SPINNER_OFFSET_CLASSES[size])} /> : null}
      {children}
      {loading ? <span className="sr-only">Memuat</span> : null}
    </button>
  );
}

export interface ButtonLinkProps extends LinkProps {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly fullWidth?: boolean;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  ...rest
}: ButtonLinkProps) {
  return <Link {...rest} className={buttonStyles({ variant, size, fullWidth, className })} />;
}