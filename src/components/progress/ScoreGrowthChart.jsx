import { TrendingUp } from "lucide-react";
import { clampScore, formatDateTime } from "@/lib/utils";

export default function ScoreGrowthChart({ history = [] }) {
  const ordered = [...history].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).slice(-8);
  const points = ordered.map((entry, index) => {
    const x = ordered.length <= 1 ? 50 : 8 + (index / (ordered.length - 1)) * 84;
    const y = 92 - (clampScore(entry.analysis?.overall_score) / 100) * 76;
    return { x, y, entry };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const latest = clampScore(history[0]?.analysis?.overall_score || 0);
  const first = clampScore(ordered[0]?.analysis?.overall_score || latest);
  const delta = latest - first;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linkedin/10">
            <TrendingUp className="h-5 w-5 text-linkedin-light" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Score Growth</h2>
            <p className="text-sm text-muted-foreground">Your last {ordered.length || 0} saved analyses</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-2 text-right">
          <span className="block text-2xl font-black text-foreground">{latest || "--"}</span>
          <span className={`text-xs font-bold ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {history.length > 1 ? `${delta >= 0 ? "+" : ""}${delta} change` : "latest score"}
          </span>
        </div>
      </div>

      {points.length ? (
        <div className="overflow-hidden rounded-xl border border-border bg-muted/20 p-4">
          <svg viewBox="0 0 100 100" className="h-64 w-full" preserveAspectRatio="none" aria-label="Score growth chart">
            {[20, 40, 60, 80].map((y) => (
              <line key={y} x1="0" x2="100" y1={100 - y} y2={100 - y} stroke="hsl(var(--border))" strokeWidth="0.4" />
            ))}
            <path d={path} fill="none" stroke="#378FE9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
            {points.map((point) => (
              <circle key={point.entry.id} cx={point.x} cy={point.y} r="1.7" fill="#22c55e" vectorEffect="non-scaling-stroke">
                <title>{`${formatDateTime(point.entry.createdAt)}: ${point.entry.analysis?.overall_score}`}</title>
              </circle>
            ))}
          </svg>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center">
          <p className="font-semibold text-foreground">No saved scores yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Run an analysis to start tracking profile growth.</p>
        </div>
      )}
    </div>
  );
}
