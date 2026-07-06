import type { ElementType, ReactNode } from "react";
import { cn } from "../../lib/cn";

type CardProps = {
  variant?: "default" | "elevated" | "accent" | "ghost";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
  as?: ElementType;
};

const variants = {
  default: "card",
  elevated: "card-elevated",
  accent: "rounded-[var(--radius-card)] border border-primary/20 bg-primary/5 dark:border-primary/25 dark:bg-primary/10",
  ghost: "rounded-[var(--radius-card)] border border-dashed border-line bg-surface/50 dark:bg-surface/30",
};

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export default function Card({
  variant = "default",
  padding = "md",
  className,
  children,
  as: Tag = "div",
}: CardProps) {
  return (
    <Tag className={cn(variants[variant], paddings[padding], className)}>
      {children}
    </Tag>
  );
}
