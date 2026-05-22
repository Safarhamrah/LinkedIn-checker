import { FileSearch } from "lucide-react";

export default function ATSTips({ tips = [] }) {
  return (
    <div className="print-card rounded-2xl border border-border bg-card p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linkedin/10">
          <FileSearch className="h-5 w-5 text-linkedin-light" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">ATS Tips</h2>
          <p className="text-sm text-muted-foreground">Improvements for recruiter and application matching.</p>
        </div>
      </div>
      <ol className="space-y-3">
        {tips.map((tip, index) => (
          <li key={tip} className="flex gap-3 rounded-xl bg-muted/30 p-3 text-sm leading-relaxed text-foreground">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-linkedin/10 text-xs font-bold text-linkedin-light">
              {index + 1}
            </span>
            {tip}
          </li>
        ))}
      </ol>
    </div>
  );
}
