export default function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm text-ink dark:text-bg">
      <p className="font-semibold">تعذّر تحميل البيانات</p>
      <p className="mt-1 opacity-80">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
