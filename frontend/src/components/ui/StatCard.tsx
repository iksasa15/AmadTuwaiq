import type { LucideIcon } from "lucide-react";
import Card from "./Card";
import { cn } from "../../lib/cn";

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
  className?: string;
};

export default function StatCard({ label, value, icon: Icon, color, className }: StatCardProps) {
  return (
    <Card padding="sm" className={cn("flex items-center gap-3", className)}>
      {Icon && (
        <Icon
          className="h-5 w-5 shrink-0 text-primary"
          style={color ? { color } : undefined}
          strokeWidth={1.8}
        />
      )}
      <div className="min-w-0">
        <p className="label-caps">{label}</p>
        <p
          className="text-lg font-black text-ink dark:text-bg"
          style={color ? { color } : undefined}
        >
          {value}
        </p>
      </div>
    </Card>
  );
}
