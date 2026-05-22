import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clipboard,
  Copy,
  Edit3,
  FileText,
  Filter,
  History,
  Lightbulb,
  ListChecks,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Undo2,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getHistory, updateHistoryEntry } from "@/lib/analysisHistory";
import { clampScore, cn } from "@/lib/utils";

const impactStyles = {
  high: "bg-red-500/10 text-red-400 border-red-500/25",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  polish: "bg-linkedin/10 text-linkedin-light border-linkedin/25",
};

const filters = ["All", "Headline", "About", "Experience", "Skills", "ATS", "Proof"];
const tones = ["Recruiter-friendly", "Executive", "Confident", "Warm", "Technical"];
const roadmapGroups = [
  { label: "Critical", impact: "high", className: "border-red-500/25 bg-red-500/10 text-red-400" },
  { label: "High impact", impact: "medium", className: "border-amber-500/25 bg-amber-500/10 text-amber-400" },
  { label: "Polish", impact: "polish", className: "border-linkedin/25 bg-linkedin/10 text-linkedin-light" },
];

export default function SmartFixes({ analysis, entryId }) {
  const [tone, setTone] = useState("Recruiter-friendly");
  const [activeFilter, setActiveFilter] = useState("All");
  const fixes = useMemo(() => buildSmartFixes(analysis, tone), [analysis, tone]);
  const initialDraftText = useMemo(() => formatDraft(createInitialDraft(analysis, tone)), [analysis, tone]);
  const [openFixId, setOpenFixId] = useState(fixes[0]?.id || "");
  const [appliedFixes, setAppliedFixes] = useState([]);
  const [draftText, setDraftText] = useState(initialDraftText);
  const [history, setHistory] = useState([]);
  const [copyStatus, setCopyStatus] = useState("");
  const [suggestionEdits, setSuggestionEdits] = useState({});
  const [draftVersions, setDraftVersions] = useState([]);

  useEffect(() => {
    setOpenFixId(fixes[0]?.id || "");
    setActiveFilter("All");
    setAppliedFixes([]);
    setDraftText(initialDraftText);
    setHistory([]);
    setSuggestionEdits(Object.fromEntries(fixes.map((fix) => [fix.id, fix.suggestion])));
    setDraftVersions(getHistory().find((entry) => entry.id === entryId)?.draftVersions || []);
  }, [analysis, entryId, fixes, initialDraftText]);

  useEffect(() => {
    if (!entryId) return;
    updateHistoryEntry(entryId, {
      appliedFixes,
      finalDraft: draftText,
      potentialScore: getPotentialScore(analysis?.overall_score || 0, fixes, appliedFixes),
      targetRole: analysis?.target_role || "",
      smartFixTone: tone,
      draftVersions,
      lastDraftUpdateAt: new Date().toISOString(),
    });
  }, [analysis, appliedFixes, draftText, draftVersions, entryId, fixes, tone]);

  const visibleFixes = useMemo(
    () => fixes.filter((fix) => activeFilter === "All" || fix.category === activeFilter),
    [activeFilter, fixes]
  );
  const priorityFixes = useMemo(() => fixes.slice(0, 3), [fixes]);
  const openFix = fixes.find((fix) => fix.id === openFixId) || fixes[0];
  const appliedCount = appliedFixes.length;
  const currentScore = clampScore(analysis?.overall_score || 0);
  const projectedScore = getPotentialScore(currentScore, fixes, appliedFixes);
  const allFixesScore = getPotentialScore(currentScore, fixes, fixes.map((fix) => fix.id));
  const sectionMap = useMemo(() => parseDraft(draftText), [draftText]);
  const editedSuggestion = openFix ? suggestionEdits[openFix.id] ?? openFix.suggestion : "";
  const confidenceChecks = useMemo(
    () => buildConfidenceChecks(openFix, editedSuggestion, analysis),
    [analysis, editedSuggestion, openFix]
  );

  const remember = () => {
    setHistory((current) => [...current.slice(-9), { draftText, appliedFixes }]);
  };

  const handleApply = (fix) => {
    const suggestion = suggestionEdits[fix.id] ?? fix.suggestion;
    const nextAppliedFixes = appliedFixes.includes(fix.id) ? appliedFixes : [...appliedFixes, fix.id];
    const nextDraftText = formatDraft(applyFix(parseDraft(draftText), { ...fix, suggestion }));
    remember();
    setDraftText(nextDraftText);
    setAppliedFixes(nextAppliedFixes);
    setOpenFixId(fix.id);
    saveDraftVersion(`Applied ${fix.title}`, nextDraftText, nextAppliedFixes);
  };

  const handleApplyAll = () => {
    const nextAppliedFixes = fixes.map((fix) => fix.id);
    const nextDraftText = formatDraft(
      fixes.reduce((draft, fix) => applyFix(draft, { ...fix, suggestion: suggestionEdits[fix.id] ?? fix.suggestion }), parseDraft(draftText))
    );
    remember();
    setDraftText(nextDraftText);
    setAppliedFixes(nextAppliedFixes);
    setOpenFixId(fixes[0]?.id || "");
    saveDraftVersion("Applied all Smart Fixes", nextDraftText, nextAppliedFixes);
  };

  const handleUndo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    setDraftText(previous.draftText);
    setAppliedFixes(previous.appliedFixes);
    setHistory((current) => current.slice(0, -1));
  };

  const handleReset = () => {
    remember();
    setDraftText(initialDraftText);
    setAppliedFixes([]);
    setOpenFixId(fixes[0]?.id || "");
    saveDraftVersion("Reset to original draft", initialDraftText, []);
  };

  const handleCopy = (label, text) => {
    copyText(text);
    setCopyStatus(label);
    window.setTimeout(() => setCopyStatus(""), 1600);
  };

  const handleSuggestionChange = (value) => {
    if (!openFix) return;
    setSuggestionEdits((current) => ({ ...current, [openFix.id]: value }));
  };

  const handleDraftChange = (event) => {
    setDraftText(event.target.value);
  };

  const handleManualVersion = () => {
    saveDraftVersion("Manual saved draft", draftText, appliedFixes);
  };

  const handleRestoreVersion = (version) => {
    remember();
    setDraftText(version.text);
    setAppliedFixes(version.appliedFixes || []);
  };

  const saveDraftVersion = (label, text, versionAppliedFixes) => {
    const version = {
      id: crypto.randomUUID(),
      label,
      createdAt: new Date().toISOString(),
      score: getPotentialScore(currentScore, fixes, versionAppliedFixes),
      appliedCount: versionAppliedFixes.length,
      appliedFixes: versionAppliedFixes,
      text,
    };
    setDraftVersions((current) => [version, ...current.filter((item) => item.text !== text)].slice(0, 8));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linkedin/10">
                <Wand2 className="h-5 w-5 text-linkedin-light" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Smart Fixes</h2>
                <p className="text-sm text-muted-foreground">Click an issue, apply a fix, then personalize the editable draft.</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
              {appliedCount}/{fixes.length} applied
            </span>
          </div>

          <div className="mb-4 grid gap-3 rounded-2xl border border-border bg-muted/20 p-4 sm:grid-cols-3">
            <ScoreStat label="Current" value={currentScore} />
            <ScoreStat label={appliedCount ? "Projected" : "With applied"} value={projectedScore} highlight />
            <ScoreStat label="Apply all" value={allFixesScore} />
          </div>

          <RoadmapPanel fixes={fixes} appliedFixes={appliedFixes} onOpen={setOpenFixId} />

          <div className="mb-4 rounded-2xl border border-border bg-background/40 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
              <Target className="h-4 w-4 text-linkedin-light" />
              Fix these first
            </div>
            <ol className="space-y-2">
              {priorityFixes.map((fix, index) => (
                <li key={fix.id} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="font-black text-linkedin-light">{index + 1}.</span>
                  <button type="button" className="text-left font-semibold text-foreground hover:text-linkedin-light" onClick={() => setOpenFixId(fix.id)}>
                    {fix.title}
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              Section filter
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-bold transition-colors",
                    activeFilter === filter
                      ? "border-linkedin bg-linkedin text-white"
                      : "border-border bg-background/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {visibleFixes.length ? (
              visibleFixes.map((fix, index) => (
                <motion.button
                  key={fix.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  type="button"
                  onClick={() => setOpenFixId(fix.id)}
                  className={cn(
                    "w-full rounded-2xl border p-4 text-left transition-all",
                    openFixId === fix.id
                      ? "border-linkedin/50 bg-linkedin/10 shadow-lg shadow-linkedin/10"
                      : "border-border bg-muted/20 hover:border-linkedin/30 hover:bg-muted/35"
                  )}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-background">
                        {appliedFixes.includes(fix.id) ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Lightbulb className="h-4 w-4 text-linkedin-light" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{fix.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{fix.issue}</p>
                      </div>
                    </div>
                    <span className={cn("rounded-full border px-2 py-0.5 text-xs font-bold", impactStyles[fix.impact])}>
                      {fix.impactLabel}
                    </span>
                  </div>
                  <div className="ml-11 flex items-center gap-2 text-xs font-semibold text-linkedin-light">
                    <Sparkles className="h-3.5 w-3.5" />
                    Suggest fix
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-center">
                <p className="text-sm font-semibold text-foreground">No fixes in this section</p>
                <p className="mt-1 text-xs text-muted-foreground">Try another filter or apply all remaining fixes.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-linkedin-light" />
            Rewrite tone
          </div>
          <div className="flex flex-wrap gap-2">
            {tones.map((toneOption) => (
              <button
                key={toneOption}
                type="button"
                onClick={() => setTone(toneOption)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
                  tone === toneOption
                    ? "border-linkedin bg-linkedin text-white"
                    : "border-border bg-muted/30 text-muted-foreground hover:text-foreground"
                )}
              >
                {toneOption}
              </button>
            ))}
          </div>
        </div>

        {openFix && (
          <motion.div
            key={openFix.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <div className="mb-2 flex items-center gap-2 text-linkedin-light">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-[0.16em]">AI suggestion</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">{openFix.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{openFix.reason}</p>
              </div>
              <Button
                onClick={() => handleApply(openFix)}
                className="bg-gradient-to-r from-linkedin to-linkedin-light text-white hover:opacity-90"
              >
                {appliedFixes.includes(openFix.id) ? <Check className="mr-1.5 h-4 w-4" /> : <Wand2 className="mr-1.5 h-4 w-4" />}
                {appliedFixes.includes(openFix.id) ? "Reapply" : "Apply fix"}
              </Button>
            </div>

            <div className="rounded-2xl border border-linkedin/20 bg-linkedin/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                <Clipboard className="h-4 w-4 text-linkedin-light" />
                Before / after preview
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Current draft section</span>
                  <div className="mt-2 min-h-[160px] rounded-xl border border-border bg-background/60 p-3 text-sm leading-relaxed text-muted-foreground">
                    <p className="whitespace-pre-wrap">{getCurrentSectionText(sectionMap, openFix)}</p>
                  </div>
                </div>
                <div>
                  <label htmlFor="editable-suggestion" className="text-xs font-bold uppercase tracking-[0.14em] text-linkedin-light">
                    Editable AI suggestion
                  </label>
                  <Textarea
                    id="editable-suggestion"
                    value={editedSuggestion}
                    onChange={(event) => handleSuggestionChange(event.target.value)}
                    className="mt-2 min-h-[160px] resize-y border-linkedin/20 bg-background/70 text-sm leading-relaxed text-foreground"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {openFix && <ConfidencePanel checks={confidenceChecks} />}

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                <ListChecks className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Editable Optimized Draft</h3>
                <p className="text-sm text-muted-foreground">Apply fixes, edit the wording, then copy by section or all at once.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleUndo} disabled={!history.length}>
                <Undo2 className="mr-1.5 h-4 w-4" />
                Undo
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={handleApplyAll} disabled={appliedCount === fixes.length}>
                <Wand2 className="mr-1.5 h-4 w-4" />
                Apply all
              </Button>
              <Button variant="outline" size="sm" onClick={handleManualVersion}>
                <History className="mr-1.5 h-4 w-4" />
                Save version
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleCopy("draft", draftText)}>
                <Copy className="mr-1.5 h-4 w-4" />
                {copyStatus === "draft" ? "Copied" : "Copy full profile"}
              </Button>
            </div>
          </div>

          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <Clipboard className="h-3.5 w-3.5 text-linkedin-light" />
            LinkedIn copy mode
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {[
              ["headline", "Copy Headline"],
              ["about", "Copy About"],
              ["experience", "Copy Experience"],
              ["skills", "Copy Skills"],
              ["proof", "Copy Proof"],
              ["nextSteps", "Copy Next Steps"],
            ].map(([key, label]) => (
              <Button key={key} variant="outline" size="sm" onClick={() => handleCopy(key, sectionMap[key] || "")}>
                <FileText className="mr-1.5 h-4 w-4" />
                {copyStatus === key ? "Copied" : label}
              </Button>
            ))}
          </div>

          <Textarea
            value={draftText}
            onChange={handleDraftChange}
            className="min-h-[420px] resize-y border-border bg-muted/35 font-mono text-xs leading-relaxed text-foreground"
          />
        </div>

        <DraftVersionsPanel versions={draftVersions} onCopy={handleCopy} onRestore={handleRestoreVersion} copyStatus={copyStatus} />
      </div>
    </div>
  );
}

function RoadmapPanel({ fixes, appliedFixes, onOpen }) {
  const applied = new Set(appliedFixes);

  return (
    <div className="mb-4 rounded-2xl border border-border bg-background/40 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
        <ListChecks className="h-4 w-4 text-linkedin-light" />
        Fix priority roadmap
      </div>
      <div className="grid gap-3">
        {roadmapGroups.map((group) => {
          const groupFixes = fixes.filter((fix) => fix.impact === group.impact);
          const appliedCount = groupFixes.filter((fix) => applied.has(fix.id)).length;
          return (
            <div key={group.label} className="rounded-xl border border-border bg-muted/20 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className={cn("rounded-full border px-2 py-0.5 text-xs font-bold", group.className)}>{group.label}</span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {appliedCount}/{groupFixes.length} done
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {groupFixes.length ? (
                  groupFixes.map((fix) => (
                    <button
                      key={fix.id}
                      type="button"
                      onClick={() => onOpen(fix.id)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                        applied.has(fix.id)
                          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                          : "border-border bg-background/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {fix.title}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">Nothing urgent here.</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConfidencePanel({ checks }) {
  const Icon = checks.status === "Needs review" ? AlertTriangle : ShieldCheck;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              checks.status === "Needs review" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Confidence check</h3>
            <p className="text-sm text-muted-foreground">Keep the rewrite smart, specific, and honest before publishing.</p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold",
            checks.status === "Needs review"
              ? "border-amber-500/25 bg-amber-500/10 text-amber-400"
              : "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
          )}
        >
          {checks.status}
        </span>
      </div>
      <div className="space-y-2">
        {checks.items.map((item) => (
          <div key={item} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-linkedin-light" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DraftVersionsPanel({ versions, onCopy, onRestore, copyStatus }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linkedin/10">
          <History className="h-5 w-5 text-linkedin-light" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Saved draft versions</h3>
          <p className="text-sm text-muted-foreground">Every applied draft can be restored, copied, or compared later.</p>
        </div>
      </div>

      {versions.length ? (
        <div className="space-y-3">
          {versions.map((version) => (
            <div key={version.id} className="rounded-xl border border-border bg-muted/20 p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-foreground">{version.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Score {version.score} - {version.appliedCount} fixes - {new Date(version.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => onRestore(version)}>
                    <RotateCcw className="mr-1.5 h-4 w-4" />
                    Restore
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onCopy(version.id, version.text)}>
                    <Copy className="mr-1.5 h-4 w-4" />
                    {copyStatus === version.id ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5 text-center">
          <p className="text-sm font-semibold text-foreground">No versions saved yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Apply a fix or use Save version to keep a draft checkpoint.</p>
        </div>
      )}
    </div>
  );
}

function ScoreStat({ label, value, highlight = false }) {
  return (
    <div className={cn("rounded-xl border border-border p-3", highlight && "border-linkedin/40 bg-linkedin/10")}>
      <span className="block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <span className="mt-1 block text-2xl font-black text-foreground">{value}</span>
    </div>
  );
}

function createInitialDraft(analysis, tone) {
  const targetRole = analysis?.target_role || "target role";
  return {
    headline: cleanText(analysis?.sections?.headline?.current, `Add a clear headline for ${targetRole} that names your specialty and value.`),
    about: cleanText(analysis?.sections?.summary?.current, buildAboutFallback(analysis?.keywords?.found || [], targetRole, tone)),
    experience: "Add 3-5 accomplishment bullets for each recent role. Lead with outcomes, scope, tools, and measurable business impact.",
    skills: buildSkillsLine(analysis),
    proof: "Add featured work, portfolio links, case studies, or recommendations that validate your strongest claims.",
    nextSteps: "Review each applied fix, personalize numbers and examples, then paste the final sections back into LinkedIn.",
  };
}

function buildSmartFixes(analysis, tone) {
  const sections = analysis?.sections || {};
  const keywords = analysis?.keywords || {};
  const foundKeywords = keywords.found || [];
  const missingKeywords = keywords.missing || [];
  const targetRole = analysis?.target_role || "";
  const fixes = [];

  if ((sections.headline?.score || 0) < 85) {
    fixes.push({
      id: "headline",
      category: "Headline",
      title: "Strengthen the headline",
      issue: sections.headline?.summary || "Your headline can be sharper and more searchable.",
      reason: "Recruiters scan the headline first. A strong version should combine role, specialty, keywords, and a clear value promise.",
      suggestion: tuneText(sections.headline?.improved || buildHeadlineFallback(foundKeywords, targetRole), tone, "headline"),
      section: "headline",
      scoreLift: 8,
      impact: "high",
      impactLabel: "High impact",
    });
  }

  if ((sections.summary?.score || 0) < 85) {
    fixes.push({
      id: "about",
      category: "About",
      title: "Rewrite the About section",
      issue: sections.summary?.summary || "The About section needs more positioning and proof.",
      reason: "The About section should quickly explain your audience, core strengths, evidence, and what kind of work you want next.",
      suggestion: tuneText(sections.summary?.improved || buildAboutFallback(foundKeywords, targetRole, tone), tone, "about"),
      section: "about",
      scoreLift: 10,
      impact: "high",
      impactLabel: "High impact",
    });
  }

  if ((sections.experience?.score || 0) < 82) {
    fixes.push({
      id: "experience",
      category: "Experience",
      title: "Turn experience into achievement bullets",
      issue: sections.experience?.summary || "Experience needs clearer scope and measurable business outcomes.",
      reason: "Achievement bullets make your profile easier to trust because they show what changed because of your work.",
      suggestion: buildExperienceFix(foundKeywords, tone),
      section: "experience",
      scoreLift: 12,
      impact: "high",
      impactLabel: "High impact",
    });
  }

  if ((sections.skills?.score || 0) < 82 || missingKeywords.length > 0) {
    fixes.push({
      id: "skills",
      category: "Skills",
      title: "Improve keyword coverage",
      issue: sections.skills?.summary || "Your skills section can better support search and ATS matching.",
      reason: "A well-curated skills list helps LinkedIn search and recruiter filters connect your profile to relevant roles.",
      suggestion: buildSkillsFix(foundKeywords, missingKeywords, targetRole),
      section: "skills",
      scoreLift: 7,
      impact: "medium",
      impactLabel: "Medium impact",
    });
  }

  if ((sections.education?.score || 0) < 70) {
    fixes.push({
      id: "education",
      category: "Proof",
      title: "Add credentials with context",
      issue: sections.education?.summary || "Education or credentials are thin or missing.",
      reason: "Credentials are most useful when they reinforce the role you want, not when they read like a bare list.",
      suggestion: "Education & Credentials\n- Add degree, institution, and dates if appropriate.\n- Add relevant certifications, executive programs, technical courses, or portfolio-based training.\n- Include coursework only when it supports your target role or industry.",
      section: "nextSteps",
      scoreLift: 4,
      impact: "polish",
      impactLabel: "Polish",
    });
  }

  if ((sections.recommendations?.score || 0) < 70) {
    fixes.push({
      id: "proof",
      category: "Proof",
      title: "Add social proof",
      issue: sections.recommendations?.summary || "The profile needs more external validation.",
      reason: "Recommendations, featured links, and project proof make the profile feel credible beyond self-description.",
      suggestion: "Proof plan\n- Ask 2 managers, peers, or clients for recommendations tied to measurable outcomes.\n- Add 1-2 featured projects, case studies, decks, articles, or portfolio links.\n- Use recommendation prompts such as: 'Could you mention the problem we solved, my role, and the business result?'",
      section: "proof",
      scoreLift: 6,
      impact: "medium",
      impactLabel: "Medium impact",
    });
  }

  fixes.push({
    id: "ats",
    category: "ATS",
    title: "Place keywords naturally",
    issue: "Important keywords should appear in context, not only as a skills list.",
    reason: "Search and ATS systems reward relevant keywords when they appear inside credible profile sections.",
    suggestion: buildAtsFix(foundKeywords, missingKeywords, targetRole),
    section: "nextSteps",
    scoreLift: 5,
    impact: "polish",
    impactLabel: "Polish",
  });

  return fixes.slice(0, 8);
}

function getPotentialScore(currentScore, fixes, appliedFixIds) {
  const applied = new Set(appliedFixIds);
  const lift = fixes.reduce((sum, fix) => (applied.has(fix.id) ? sum + fix.scoreLift : sum), 0);
  return clampScore(currentScore + Math.min(32, lift));
}

function getCurrentSectionText(sectionMap, fix) {
  if (!fix) return "";
  const current = sectionMap[fix.section] || "";
  if (fix.section === "nextSteps") return current || "No action plan has been created yet.";
  return current || "No draft text detected for this section yet.";
}

function buildConfidenceChecks(fix, suggestion, analysis) {
  if (!fix) {
    return { status: "Clear", items: ["Choose a fix to review the suggestion before applying it."] };
  }

  const items = [];
  const text = suggestion || "";
  if (/\[[^\]]+\]/.test(text)) {
    items.push("Replace bracketed placeholders with real scope, metrics, tools, or remove them before publishing.");
  }
  if (/\b\d+(?:\.\d+)?\s*(%|x|k|m|million|billion|users|customers|revenue|savings)\b/i.test(text)) {
    items.push("Confirm every number is accurate and backed by real work before pasting it into LinkedIn.");
  }
  if ((analysis?.keywords?.missing || []).some((keyword) => text.toLowerCase().includes(keyword.toLowerCase()))) {
    items.push("Only keep newly added keywords that honestly match your background and examples.");
  }
  if (text.length > 900) {
    items.push("This rewrite is long for LinkedIn scanning; trim repeated claims or split into bullets.");
  }
  if (!items.length) {
    items.push("No invented metrics detected; still personalize examples so the rewrite sounds like you.");
    items.push("The wording is specific enough to apply, then tune with your real numbers and examples.");
  }

  return {
    status: items.some((item) => item.includes("Replace") || item.includes("Confirm") || item.includes("Only keep") || item.includes("trim"))
      ? "Needs review"
      : "Clear",
    items,
  };
}

function applyFix(draft, fix) {
  if (!fix?.section) return draft;
  return {
    ...draft,
    [fix.section]:
      fix.section === "nextSteps"
        ? mergeActionPlan(draft[fix.section], fix.suggestion)
        : mergeSection(draft[fix.section], fix.suggestion),
  };
}

function mergeSection(current, suggestion) {
  if (!current || current.startsWith("Add ")) return suggestion;
  if (current === suggestion || current.includes(suggestion)) return current;
  return suggestion;
}

function mergeActionPlan(current, suggestion) {
  if (!current || current.startsWith("Review each applied")) return suggestion;
  if (current.includes(suggestion)) return current;
  return `${current}\n\n${suggestion}`;
}

function formatDraft(draft) {
  return [
    `HEADLINE\n${draft.headline || ""}`,
    `ABOUT\n${draft.about || ""}`,
    `EXPERIENCE\n${draft.experience || ""}`,
    `SKILLS\n${draft.skills || ""}`,
    `PROOF\n${draft.proof || ""}`,
    `NEXT STEPS\n${draft.nextSteps || ""}`,
  ].join("\n\n");
}

function parseDraft(text) {
  const keys = [
    ["headline", "HEADLINE"],
    ["about", "ABOUT"],
    ["experience", "EXPERIENCE"],
    ["skills", "SKILLS"],
    ["proof", "PROOF"],
    ["nextSteps", "NEXT STEPS"],
  ];
  const headingMap = new Map(keys.map(([key, heading]) => [heading, key]));
  const draft = Object.fromEntries(keys.map(([key]) => [key, ""]));
  let activeKey = null;

  text.split(/\r?\n/).forEach((line) => {
    const headingKey = headingMap.get(line.trim().toUpperCase());
    if (headingKey) {
      activeKey = headingKey;
      return;
    }

    if (!activeKey) return;
    draft[activeKey] = draft[activeKey] ? `${draft[activeKey]}\n${line}` : line;
  });

  Object.keys(draft).forEach((key) => {
    draft[key] = draft[key].trim();
  });
  return draft;
}

function cleanText(value, fallback) {
  if (!value || value.includes("No clear") || value.includes("No About")) return fallback;
  return value.trim();
}

function buildHeadlineFallback(foundKeywords, targetRole) {
  const strengths = titleCaseList(foundKeywords.slice(0, 3));
  const role = targetRole || "Results-Driven Professional";
  return `${role} | ${strengths || "Strategy, Execution, Growth"} | Building measurable outcomes across teams`;
}

function buildAboutFallback(foundKeywords, targetRole, tone) {
  const focus = foundKeywords.slice(0, 5).join(", ") || "strategy, execution, collaboration, and measurable outcomes";
  const target = targetRole ? ` for ${targetRole} roles` : "";
  const base = `I help teams turn complex goals into practical plans, stronger execution, and measurable results${target}. My work blends ${focus} with clear communication, stakeholder alignment, and disciplined follow-through.`;
  return tuneText(`${base}\n\nI am strongest when translating ambiguity into action, building momentum across teams, and creating operating habits that make results repeatable.`, tone, "about");
}

function buildExperienceFix(foundKeywords, tone) {
  const context = foundKeywords.slice(0, 4).join(", ") || "strategy, execution, collaboration, and analysis";
  const leadVerb = tone === "Executive" ? "Owned" : tone === "Technical" ? "Built" : "Led";
  return `Use this structure for each role:\n- ${leadVerb} [team/scope] to deliver [project or initiative], improving [metric] by [number].\n- Built or improved [process/product/system] using ${context}, reducing friction and creating a measurable business result.\n- Partnered with [stakeholders] to align priorities, communicate tradeoffs, and move work from idea to shipped outcome.\n- Add tools, scale, audience, revenue, cost, time, quality, or customer impact wherever accurate.`;
}

function buildSkillsFix(foundKeywords, missingKeywords, targetRole) {
  const current = foundKeywords.slice(0, 10);
  const missing = missingKeywords.slice(0, 8);
  const combined = [...new Set([...current, ...missing])].filter(Boolean);
  const targetLine = targetRole ? `Target role: ${targetRole}\n` : "";
  return `${targetLine}Core skills: ${titleCaseList(combined) || "Strategy, Analytics, Leadership, Project Management, Stakeholder Management"}\n\nOnly add missing keywords that honestly match your background. Strong candidates weave these terms into About and Experience, not just Skills.`;
}

function buildAtsFix(foundKeywords, missingKeywords, targetRole) {
  const primary = foundKeywords.slice(0, 5).join(", ") || "your strongest role keywords";
  const opportunities = missingKeywords.slice(0, 5).join(", ") || "target-job keywords you can accurately support";
  const targetLine = targetRole ? `- Target role: make "${targetRole}" visible in the headline or About section.\n` : "";
  return `Keyword placement plan\n${targetLine}- Headline: include 2-3 primary terms such as ${primary}.\n- About: use those terms in a natural positioning paragraph.\n- Experience: attach keywords to proof, metrics, tools, and outcomes.\n- Skills: add relevant missing terms such as ${opportunities} only if they reflect real experience.`;
}

function buildSkillsLine(analysis) {
  const found = analysis?.keywords?.found || [];
  if (!found.length) return "Add 12-18 role-specific skills that match your target roles and actual experience.";
  return titleCaseList(found.slice(0, 14));
}

function tuneText(text, tone, section) {
  if (tone === "Executive" && section === "headline") return text.replace("Turning complex goals into measurable outcomes", "Leading strategy, execution, and measurable business outcomes");
  if (tone === "Technical" && section === "headline") return text.replace("Turning complex goals into measurable outcomes", "Building scalable systems and measurable product outcomes");
  if (tone === "Warm" && section === "about") return `${text}\n\nColleagues know me for clear communication, calm execution, and helping teams do their best work.`;
  if (tone === "Confident" && section === "about") return text.replace("I help teams", "I consistently help teams");
  return text;
}

function titleCaseList(values) {
  return values
    .filter(Boolean)
    .map(formatKeyword)
    .join(", ");
}

function formatKeyword(value) {
  const normalized = value.toLowerCase();
  const acronyms = {
    ai: "AI",
    ats: "ATS",
    aws: "AWS",
    saas: "SaaS",
  };
  if (acronyms[normalized]) return acronyms[normalized];
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  } catch {
    fallbackCopy(text);
  }
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
