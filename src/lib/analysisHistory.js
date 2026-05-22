const HISTORY_KEY = "profilepro_analysis_history";

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function getHistory() {
  if (typeof window === "undefined") return [];
  const entries = safeParse(localStorage.getItem(HISTORY_KEY), []);
  return Array.isArray(entries)
    ? entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];
}

export function saveAnalysis(profileText, analysis, options = {}) {
  if (!analysis) return null;
  const history = getHistory();
  const lines = profileText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const username = extractUsername(lines, profileText);
  const profileUrl = lines.find((line) => /^https?:\/\/(www\.)?linkedin\.com/i.test(line)) || "";
  const targetRole = options.targetRole || analysis.target_role || "";
  const fingerprint = getFingerprint(profileText, analysis, targetRole);
  const recentMatch = history.find(
    (entry) =>
      entry.fingerprint === fingerprint &&
      Date.now() - new Date(entry.createdAt).getTime() < 10 * 60 * 1000
  );
  if (recentMatch) {
    if (targetRole && !recentMatch.targetRole) {
      updateHistoryEntry(recentMatch.id, { targetRole });
    }
    return recentMatch;
  }

  const entry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    username,
    profileUrl,
    targetRole,
    characters: profileText.length,
    fingerprint,
    analysis,
  };
  const next = [entry, ...history].slice(0, 30);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return entry;
}

export function deleteHistoryEntry(id) {
  const next = getHistory().filter((entry) => entry.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function updateHistoryEntry(id, patch) {
  const next = getHistory().map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next.find((entry) => entry.id === id) || null;
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function getActivityDays() {
  const byDay = new Map();
  for (const entry of getHistory()) {
    const day = entry.createdAt.slice(0, 10);
    byDay.set(day, (byDay.get(day) || 0) + 1);
  }
  return byDay;
}

function extractUsername(lines, profileText) {
  if (lines.length > 1) return lines[0] || "LinkedIn User";
  const lead = profileText
    .split(/\b(?:about|summary|experience|education|skills|recommendations)\b/i)[0]
    .replace(/\s+/g, " ")
    .trim();
  const words = lead.split(" ").filter(Boolean);
  if (words.length >= 2) return words.slice(0, 2).join(" ");
  return words[0] || "LinkedIn User";
}

function getFingerprint(profileText, analysis, targetRole) {
  return `${profileText.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 500)}:${analysis.overall_score || 0}:${targetRole.toLowerCase()}`;
}
