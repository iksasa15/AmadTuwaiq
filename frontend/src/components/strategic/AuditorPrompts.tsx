import { DEMO_AUDITOR_PROMPTS } from "../../data/strategicDemo";
import { MessageSquare } from "../ui/icons";

export default function AuditorPrompts() {
  const prompts = Object.values(DEMO_AUDITOR_PROMPTS);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-primary">
          <MessageSquare className="h-4 w-4" strokeWidth={2} />
          مساعد المدقق — أسئلة استجواب جاهزة
        </p>
        <p className="mt-2 text-sm text-ink-soft dark:text-bg/75">
          بمجرد رصد إشارة حمراء، يصيغ رقيب أسئلة محاسبية مدعومة بالأدلة لمواجهة الشركة في مقابلة التمويل.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {prompts.map((p) => (
          <article
            key={p.flag_id}
            className="rounded-xl border border-line bg-white p-5 dark:border-bg/10 dark:bg-ink/30"
          >
            <h3 className="font-bold text-ink dark:text-bg">{p.title_ar}</h3>
            <p className="mt-1 text-[10px] font-semibold text-primary">{p.negotiation_style}</p>
            <ol className="mt-4 space-y-3">
              {p.questions_ar.map((q, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-soft dark:text-bg/75">
                  <span className="shrink-0 font-bold text-accent">{i + 1}.</span>
                  <span>«{q}»</span>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </div>
  );
}
