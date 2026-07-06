import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  children: ReactNode;
};

const variants = {
  primary: "bg-ink text-bg hover:opacity-90 dark:bg-primary dark:text-white",
  secondary: "border border-line bg-surface text-ink-soft hover:border-primary dark:border-bg/20 dark:text-bg",
  ghost: "text-ink-soft hover:bg-bg-deep/50 dark:text-bg/70 dark:hover:bg-ink/40",
  danger: "bg-accent text-white hover:opacity-90",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-bold transition",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
