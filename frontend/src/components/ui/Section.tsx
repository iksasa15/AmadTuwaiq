import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type SectionProps = {
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function Section({ title, icon, action, children, className }: SectionProps) {
  return (
    <section className={cn("mb-6", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && (
            <h2 className="section-title flex items-center gap-2">
              {icon}
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
