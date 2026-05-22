import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteHistoryEntry } from "@/lib/analysisHistory";
import { clampScore, formatDateTime } from "@/lib/utils";

export default function SavedReportsList({ history = [], onSelect, onDelete }) {
  if (!history.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/70 p-10 text-center">
        <p className="font-semibold text-foreground">No saved reports yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Your completed analyses will appear here.</p>
      </div>
    );
  }

  const handleDelete = (id) => {
    deleteHistoryEntry(id);
    onDelete?.(id);
  };

  return (
    <div className="space-y-3">
      {history.map((entry) => (
        <div key={entry.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linkedin/10 text-xl font-black text-linkedin-light">
              {clampScore(entry.analysis?.overall_score)}
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-bold text-foreground">{entry.username}</h3>
              <p className="text-sm text-muted-foreground">{formatDateTime(entry.createdAt)} - {entry.characters.toLocaleString()} characters</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {(entry.targetRole || entry.analysis?.target_role) && (
                  <span className="rounded-full bg-linkedin/10 px-2 py-0.5 text-xs font-semibold text-linkedin-light">
                    Target: {entry.targetRole || entry.analysis.target_role}
                  </span>
                )}
                {entry.finalDraft && (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                    {entry.appliedFixes?.length || 0} fixes saved
                  </span>
                )}
                {entry.draftVersions?.length > 0 && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400">
                    {entry.draftVersions.length} draft versions
                  </span>
                )}
              </div>
              {entry.profileUrl && <p className="truncate text-xs text-linkedin-light">{entry.profileUrl}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onSelect?.(entry)}>
              <Eye className="mr-1.5 h-4 w-4" />
              View
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDelete(entry.id)} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
