export default function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white/50 py-16 text-center dark:bg-ink/20">
      <span className="mb-3 text-4xl opacity-40">📊</span>
      <h3 className="text-lg font-bold text-ink dark:text-bg">{title}</h3>
      {message && <p className="mt-2 max-w-sm text-sm text-ink-faint">{message}</p>}
    </div>
  );
}
