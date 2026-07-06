import { useState } from "react";
import { createDataSource } from "../../api/dataSource";
import { useDemoMode } from "../../hooks/useDemoMode";
import { Check, Loader2, RefreshCw } from "../ui/icons";
import Button from "../ui/Button";

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
      setMsg(`تم التحديث — ${r.companies_scored ?? 24} شركة · ${Math.round(Number(r.avg_risk_score ?? 18))} متوسط`);
      onRefreshed?.();
    } catch {
      setMsg("فشل التحديث");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="secondary"
        size="sm"
        onClick={run}
        disabled={loading}
        className="border-2 border-primary bg-primary/10 text-primary hover:bg-primary hover:text-white"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            جاري التحديث...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" strokeWidth={2} />
            تحديث الدرجات الآن
          </>
        )}
      </Button>
      {msg && (
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-status-green">
          <Check className="h-4 w-4" strokeWidth={2.5} />
          {msg}
        </span>
      )}
    </div>
  );
}
