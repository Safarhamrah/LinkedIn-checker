import { Award, CalendarCheck2, FileText, Target } from "lucide-react";
import { getHistory } from "@/lib/analysisHistory";
import { clampScore } from "@/lib/utils";

export default function ActivitySummary() {
  const history = getHistory();
  const bestScore = history.reduce((best, entry) => Math.max(best, clampScore(entry.analysis?.overall_score)), 0);
  const latestScore = clampScore(history[0]?.analysis?.overall_score || 0);
  const weekCount = history.filter((entry) => Date.now() - new Date(entry.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000).length;

  const stats = [
    { icon: FileText, label: "Reports", value: history.length },
    { icon: Target, label: "Latest score", value: latestScore || "--" },
    { icon: Award, label: "Best score", value: bestScore || "--" },
    { icon: CalendarCheck2, label: "This week", value: weekCount },
  ];

  return (
    <div className="h-full rounded-2xl border border-border bg-card p-5">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-foreground">Summary</h2>
        <p className="text-sm text-muted-foreground">Profile optimization activity</p>
      </div>
      <div className="grid gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linkedin/10">
                <stat.icon className="h-4 w-4 text-linkedin-light" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground">{stat.label}</span>
            </div>
            <span className="text-xl font-black text-foreground">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
