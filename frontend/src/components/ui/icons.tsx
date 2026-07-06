import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Building2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Check,
  Flag,
  Info,
  Layers,
  LayoutDashboard,
  Link2,
  Loader2,
  Megaphone,
  Monitor,
  Moon,
  Paperclip,
  Presentation,
  Radio,
  RefreshCw,
  Settings,
  Sun,
  Table2,
  Users,
  Wallet,
} from "lucide-react";

export type TabId = "market" | "alerts" | "mobily" | "sectors" | "about";

export {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Building2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Check,
  Flag,
  Info,
  Layers,
  LayoutDashboard,
  Link2,
  Loader2,
  Megaphone,
  Monitor,
  Moon,
  Paperclip,
  Presentation,
  Radio,
  RefreshCw,
  Settings,
  Sun,
  Table2,
  Users,
  Wallet,
};

export const TAB_ICONS: Record<TabId, LucideIcon> = {
  market: LayoutDashboard,
  alerts: Flag,
  mobily: ClipboardList,
  sectors: Building2,
  about: Info,
};

const SEVERITY_ICONS = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

const SEVERITY_COLORS = {
  critical: "text-accent",
  warning: "text-primary",
  info: "text-secondary",
} as const;

export function SeverityIcon({
  severity,
  className = "h-5 w-5",
}: {
  severity: string;
  className?: string;
}) {
  const key = severity as keyof typeof SEVERITY_ICONS;
  const Icon = SEVERITY_ICONS[key] ?? AlertTriangle;
  const color = SEVERITY_COLORS[key] ?? "text-ink-faint";
  return <Icon className={`${className} ${color}`} strokeWidth={2} aria-hidden />;
}

export function IconBox({
  icon: Icon,
  className = "",
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-ink/8 dark:bg-bg/10 ${className}`}
    >
      <Icon className="h-4 w-4 text-ink dark:text-bg" strokeWidth={2} />
    </span>
  );
}
