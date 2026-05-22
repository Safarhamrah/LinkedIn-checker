import { BarChart3, CheckCircle2, TrendingUp } from "lucide-react";
import { clampScore, cn } from "@/lib/utils";

const sectionLabels = {
  headline: "Headline",
  summary: "About",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  recommendations: "Proof",
};

export default function ScoreExplanation({ analysis }) {
  const entries = Object.entries(analysis?.sections || {}).filter(([, section]) => section?.score !== undefined);
  const score = clampScore(analysis?.overall_score || 0);
  const weakest = [...entries].sort(([, a], [, b]) => a.score - b.score).slice(0, 3);
  const strongest = [...entries].sort(([, a], [, b]) => b.score - a.score)[0];
  const liftEstimate = clampScore(score + Math.min(28, weakest.reduce((sum, [, section]) => sum + Math.max(0, 78 - section.score) * 0.3, 0)));

  return (
    <div className="print-card rounded-2xl border border-border bg-card p-5">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linkedin/10">
            <BarChart3 className="h-5 w-5 text-linkedin-light" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Score explanation</h2>
            <p className="text-sm text-muted-foreground">Why this score landed here and what would move it next.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-linkedin/25 bg-linkedin/10 px-4 py-3 text-right">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-linkedin-light">Next realistic range</p>
          <p className="text-2xl font-black text-foreground">{score}-{liftEstimate}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Strongest signal
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {strongest
              ? `${sectionLabels[strongest[0]] || strongest[0]} is currently the strongest section at ${clampScore(strongest[1].score)}.`
              : "Add more profile content to identify a strong signal."}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-4 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <TrendingUp className="h-4 w-4 text-linkedin-light" />
            Biggest score levers
          </div>
          <div className="space-y-3">
            {weakest.map(([key, section]) => (
              <div key={key}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-foreground">{sectionLabels[key] || key}</span>
                  <span className="text-xs font-bold text-muted-foreground">{clampScore(section.score)}/100</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      section.score >= 78 ? "bg-emerald-400" : section.score >= 60 ? "bg-amber-400" : "bg-red-400"
                    )}
                    style={{ width: `${clampScore(section.score)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{section.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
