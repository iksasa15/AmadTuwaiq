import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export default function PageHeader({ title, description, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-6 border-b border-line pb-5", className)}>
      {breadcrumb && <div className="mb-2 text-xs font-semibold text-ink-faint">{breadcrumb}</div>}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-ink-soft dark:text-bg/70">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
