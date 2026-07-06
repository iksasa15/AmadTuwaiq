import { BarChart3 } from "./icons";
import Card from "./Card";

export default function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <Card variant="ghost" padding="lg" className="flex flex-col items-center justify-center py-14 text-center">
      <BarChart3 className="mb-3 h-10 w-10 text-ink-faint/40" strokeWidth={1.5} />
      <h3 className="text-lg font-bold text-ink dark:text-bg">{title}</h3>
      {message && <p className="mt-2 max-w-sm text-sm text-ink-faint">{message}</p>}
    </Card>
  );
}
