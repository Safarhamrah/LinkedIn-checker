import { useMemo, useState } from "react";
import { Briefcase, CheckCircle2, Copy, Search, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { clampScore } from "@/lib/utils";

export default function JobFit({ analysis }) {
  const [jobDescription, setJobDescription] = useState("");
  const [copied, setCopied] = useState(false);

  const fit = useMemo(() => {
    const text = jobDescription.toLowerCase();
    const found = analysis?.keywords?.found || [];
    const missing = analysis?.keywords?.missing || [];
    const all = [...new Set([...found, ...missing])];
    const jobKeywords = all.filter((keyword) => text.includes(keyword.toLowerCase()));
    const matched = jobKeywords.filter((keyword) => found.includes(keyword));
    const gaps = jobKeywords.filter((keyword) => !found.includes(keyword));
    const score = jobKeywords.length ? clampScore((matched.length / jobKeywords.length) * 100) : 0;
    return { jobKeywords, matched, gaps, score };
  }, [analysis, jobDescription]);

  const coverNote = `Hi, I noticed your role emphasizes ${fit.jobKeywords.slice(0, 4).join(", ") || "clear business impact"}. My profile highlights ${fit.matched.slice(0, 4).join(", ") || "relevant experience and measurable execution"}, and I would welcome a conversation about how that background maps to your team's goals.`;

  const handleCopy = () => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(coverNote).catch(() => fallbackCopy(coverNote));
      } else {
        fallbackCopy(coverNote);
      }
    } catch {
      fallbackCopy(coverNote);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="print-card rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linkedin/10">
            <Briefcase className="h-5 w-5 text-linkedin-light" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Job Fit Matcher</h2>
            <p className="text-sm text-muted-foreground">Paste a job description to compare keyword coverage.</p>
          </div>
        </div>
        <Textarea
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste a target job description here..."
          className="min-h-72 resize-none bg-muted/40"
        />
      </div>

      <div className="space-y-6">
        <div className="print-card rounded-2xl border border-border bg-card p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-foreground">Fit Score</h3>
              <p className="text-sm text-muted-foreground">Keyword overlap with this role</p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-foreground">{fit.score}</span>
              <span className="text-sm font-bold text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-to-r from-linkedin to-emerald-400 transition-all" style={{ width: `${fit.score}%` }} />
          </div>
        </div>

        <KeywordMatch title="Matches" icon={CheckCircle2} values={fit.matched} empty="Paste a job description to see matches." />
        <KeywordMatch title="Profile Gaps" icon={XCircle} values={fit.gaps} empty="No job-specific gaps detected yet." muted />

        <div className="print-card rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-linkedin-light" />
            <h3 className="font-bold text-foreground">Starter Outreach Note</h3>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{coverNote}</p>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="mr-1.5 h-4 w-4" />
            {copied ? "Copied" : "Copy note"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function KeywordMatch({ title, icon: Icon, values, empty, muted = false }) {
  return (
    <div className="print-card rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${muted ? "text-amber-400" : "text-emerald-400"}`} />
        <h3 className="font-bold text-foreground">{title}</h3>
      </div>
      {values.length ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span key={value} className={`rounded-full px-3 py-1 text-xs font-semibold ${muted ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>
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
