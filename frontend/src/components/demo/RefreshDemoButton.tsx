import { useState } from "react";
import { createDataSource } from "../../api/dataSource";
import { useDemoMode } from "../../hooks/useDemoMode";

type Props = {
  onRefreshed?: () => void;
};

export default function RefreshDemoButton({ onRefreshed }: Props) {
  const { demoMode } = useDemoMode();
  const ds = createDataSource(demoMode);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const run = async () => {
    setLoading(true);
    setMsg("");
    try {
      const r = await ds.refresh();
      setMsg(`✓ تم التحديث — ${r.companies_scored ?? 24} شركة · ${Math.round(Number(r.avg_risk_score ?? 18))} متوسط`);
      onRefreshed?.();
    } catch {
      setMsg("فشل التحديث");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="rounded-xl border-2 border-primary bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-primary hover:text-white disabled:opacity-50 dark:hover:text-white"
      >
        {loading ? "⏳ جاري التحديث..." : "🔄 تحديث الدرجات الآن"}
      </button>
      {msg && <span className="text-sm font-semibold text-status-green">{msg}</span>}
    </div>
  );
}
