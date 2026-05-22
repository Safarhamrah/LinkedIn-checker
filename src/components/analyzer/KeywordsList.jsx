import { Check, Grid3X3, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const columns = [
  { key: "headline", label: "Headline" },
  { key: "about", label: "About" },
  { key: "experience", label: "Experience" },
  { key: "skills", label: "Skills" },
];

export default function KeywordsList({ found = [], missing = [], analysis }) {
  const heatmapRows = buildKeywordHeatmap(found, missing, analysis);

  return (
    <div className="print-card rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-1 text-xl font-bold text-foreground">Keywords</h2>
      <p className="mb-5 text-sm text-muted-foreground">Search and ATS signals detected in your profile.</p>
      <div className="space-y-6">
        <KeywordGroup icon={Check} label="Found" values={found} className="bg-emerald-500/10 text-emerald-400" empty="No strong keywords detected yet." />
        <KeywordGroup icon={Plus} label="Missing Opportunities" values={missing} className="bg-amber-500/10 text-amber-400" empty="No major keyword gaps detected." />
        <KeywordHeatmap rows={heatmapRows} />
      </div>
    </div>
  );
}

function KeywordGroup({ icon: Icon, label, values, className, empty }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-linkedin-light" />
        <h3 className="font-semibold text-foreground">{label}</h3>
      </div>
      {values.length ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span key={value} className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
              {value}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

function KeywordHeatmap({ rows }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Grid3X3 className="h-4 w-4 text-linkedin-light" />
        <h3 className="font-semibold text-foreground">Keyword heatmap</h3>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[34rem]">
          <div className="grid grid-cols-[1.25fr_repeat(4,0.75fr)] gap-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <span>Keyword</span>
            {columns.map((column) => (
              <span key={column.key}>{column.label}</span>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {rows.map((row) => (
              <div key={row.keyword} className="grid grid-cols-[1.25fr_repeat(4,0.75fr)] items-center gap-2 rounded-xl border border-border bg-background/45 p-2">
                <span className="truncate text-sm font-semibold text-foreground">{row.keyword}</span>
                {columns.map((column) => (
                  <HeatCell key={column.key} state={row[column.key]} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <LegendDot state="strong" label="Strong" />
        <LegendDot state="weak" label="Weak" />
        <LegendDot state="missing" label="Missing" />
      </div>
    </div>
  );
}

function HeatCell({ state }) {
  const meta = {
    strong: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    weak: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    missing: "bg-muted text-muted-foreground border-border",
  }[state];
  const Icon = state === "missing" ? Minus : Check;

  return (
    <span className={cn("inline-flex h-8 items-center justify-center rounded-lg border text-xs font-bold", meta)}>
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

function LegendDot({ state, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <HeatCell state={state} />
      {label}
    </span>
  );
}

function buildKeywordHeatmap(found, missing, analysis) {
  const headline = `${analysis?.sections?.headline?.current || ""} ${analysis?.sections?.headline?.improved || ""}`.toLowerCase();
  const about = `${analysis?.sections?.summary?.current || ""} ${analysis?.sections?.summary?.improved || ""}`.toLowerCase();
  const experience = `${analysis?.sections?.experience?.summary || ""} ${analysis?.overall_summary || ""}`.toLowerCase();
  const skills = found.join(" ").toLowerCase();
  const keywords = [...new Set([...found.slice(0, 8), ...missing.slice(0, 4)])].filter(Boolean);
  const textBySection = { headline, about, experience, skills };

  return keywords.map((keyword) => {
    const normalized = keyword.toLowerCase();
    return {
      keyword,
      ...Object.fromEntries(
        columns.map((column) => {
          const exact = textBySection[column.key].includes(normalized);
          const partial = normalized.split(/\s+/).some((part) => part.length > 3 && textBySection[column.key].includes(part));
          return [column.key, exact ? "strong" : partial ? "weak" : "missing"];
        })
      ),
    };
  });
}
