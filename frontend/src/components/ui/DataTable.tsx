import type { ReactNode } from "react";
import Card from "./Card";
import { cn } from "../../lib/cn";

type DataTableProps = {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function DataTable({ title, action, children, className }: DataTableProps) {
  return (
    <Card padding="none" variant="elevated" className={cn("overflow-hidden", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-line px-4 py-3 dark:border-bg/10">
          {title && <h2 className="font-bold text-ink dark:text-bg">{title}</h2>}
          {action}
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
    </Card>
  );
}

export function DataTableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="table-head border-b border-line text-right dark:border-bg/10">{children}</tr>
    </thead>
  );
}

export function DataTableTh({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={cn("px-5 py-3.5 text-sm font-semibold", className)}>{children}</th>;
}

export function DataTableRow({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "border-b border-line/60 dark:border-bg/5",
        onClick && "cursor-pointer table-row-hover",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function DataTableTd({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-5 py-3.5 text-sm", className)}>{children}</td>;
}
