import { CheckCircle2, Circle } from "lucide-react";

export default function ProfileChecklist({ items = [] }) {
  const completeCount = items.filter((item) => item.completed).length;
  const percent = items.length ? Math.round((completeCount / items.length) * 100) : 0;

  return (
    <div className="print-card rounded-2xl border border-border bg-card p-5">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-foreground">Profile Checklist</h2>
          <p className="text-sm text-muted-foreground">{completeCount} of {items.length} best-practice items complete</p>
        </div>
        <span className="rounded-full bg-linkedin/10 px-3 py-1 text-sm font-bold text-linkedin-light">{percent}% complete</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3">
            {item.completed ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            ) : (
              <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            )}
            <span className="text-sm text-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
