import { BarChart3 } from "./icons";

export default function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-white/50 py-14 text-center dark:bg-ink/20">
      <BarChart3 className="mb-3 h-10 w-10 text-ink-faint/40" strokeWidth={1.5} />
      <h3 className="text-lg font-bold text-ink dark:text-bg">{title}</h3>
      {message && <p className="mt-2 max-w-sm text-sm text-ink-faint">{message}</p>}
    </div>
  );
}
