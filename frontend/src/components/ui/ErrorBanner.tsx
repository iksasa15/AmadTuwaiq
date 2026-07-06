import Button from "./Button";
import Card from "./Card";

export default function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card variant="accent" className="border-accent/40 bg-accent/10">
      <p className="text-sm font-semibold text-ink dark:text-bg">تعذّر تحميل البيانات</p>
      <p className="mt-1 text-sm opacity-80">{message}</p>
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry} className="mt-3">
          إعادة المحاولة
        </Button>
      )}
    </Card>
  );
}
