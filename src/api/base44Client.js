import { clampScore } from "@/lib/utils";

const SECTION_HEADINGS = [
  "about",
  "summary",
  "experience",
  "education",
  "skills",
  "licenses",
  "certifications",
  "recommendations",
  "projects",
  "volunteering",
];

const KEYWORD_BANK = [
  "leadership",
  "strategy",
  "analytics",
  "data",
  "growth",
  "operations",
  "product",
  "marketing",
  "sales",
  "customer success",
  "software",
  "javascript",
  "react",
  "typescript",
  "python",
  "cloud",
  "aws",
  "machine learning",
  "ai",
  "automation",
  "project management",
  "stakeholder management",
  "cross-functional",
  "revenue",
  "go-to-market",
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, " ");
}

function getLines(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function findSection(lines, names, fullText = "") {
  const startIndex = lines.findIndex((line) => names.includes(line.toLowerCase()));
  if (startIndex !== -1) {
    const collected = [];
    for (let i = startIndex + 1; i < lines.length; i += 1) {
      const lower = lines[i].toLowerCase();
      if (SECTION_HEADINGS.includes(lower)) break;
      collected.push(lines[i]);
    }
    return collected.join("\n").trim();
  }

  const headings = names.map(escapeRegExp).join("|");
  const boundaries = SECTION_HEADINGS.filter((heading) => !names.includes(heading)).map(escapeRegExp).join("|");
  const inlineMatch = fullText.match(new RegExp(`(?:^|\\b)(${headings})\\b\\s*([\\s\\S]*?)(?=\\b(?:${boundaries})\\b|$)`, "i"));
  return inlineMatch?.[2]?.trim() || "";
}

function scorePresence(value, strongAt, base = 35) {
  if (!value) return 15;
  const ratio = Math.min(1, value.length / strongAt);
  return clampScore(base + ratio * (100 - base));
}

function scoreExperience(text) {
  const lower = normalize(text);
  let score = 25;
  if (lower.includes("experience")) score += 18;
  if (/\b\d+\+?\s*(years?|yrs?)\b/.test(lower)) score += 12;
  if (/%|\$|\b\d+x\b|\b\d+k\b|\b\d+m\b/.test(lower)) score += 15;
  if (/(led|built|launched|managed|improved|increased|reduced|owned|delivered)/.test(lower)) score += 14;
  if (text.length > 900) score += 16;
  return clampScore(score);
}

function firstLikelyHeadline(lines, fullText) {
  if (lines.length === 0) return "";
  if (lines.length === 1) {
    return fullText
      .split(/\b(?:about|summary|experience|education|skills|recommendations)\b/i)[0]
      .replace(/\s+/g, " ")
      .trim();
  }
  const nonUrlLines = lines.filter((line) => !/^https?:\/\//i.test(line));
  return nonUrlLines[1] || nonUrlLines[0] || "";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function analyzeProfileText(profileText, targetRole = "") {
  const lines = getLines(profileText);
  const lower = normalize(profileText);
  const target = targetRole.trim();
  const headline = firstLikelyHeadline(lines, profileText);
  const summary = findSection(lines, ["about", "summary"], profileText) || "";
  const skillsText = findSection(lines, ["skills"], profileText) || "";
  const educationText = findSection(lines, ["education"], profileText) || "";
  const recommendationsText = findSection(lines, ["recommendations"], profileText) || "";

  const headlineScore = clampScore(
    scorePresence(headline, 120, 42) +
      (/( at | \| | - | founder|director|manager|engineer|designer|consultant|specialist|lead)/i.test(headline) ? 8 : -6)
  );
  const summaryScore = scorePresence(summary, 650, 28);
  const experienceScore = scoreExperience(profileText);
  const educationScore = scorePresence(educationText, 160, 40);
  const skillsScore = clampScore(
    scorePresence(skillsText, 240, 35) +
      (skillsText.split(/,|\n|\u2022/).filter((skill) => skill.trim().length > 1).length >= 8 ? 8 : -8)
  );
  const recommendationsScore = scorePresence(recommendationsText, 220, 30);

  const targetKeywords = extractTargetKeywords(target);
  const found = [...new Set([...KEYWORD_BANK.filter((keyword) => lower.includes(keyword)), ...targetKeywords.filter((keyword) => lower.includes(keyword))])];
  const missing = KEYWORD_BANK.filter((keyword) => !found.includes(keyword)).slice(0, 10);
  const sectionScores = [headlineScore, summaryScore, experienceScore, educationScore, skillsScore, recommendationsScore];
  const overall = clampScore(sectionScores.reduce((sum, score) => sum + score, 0) / sectionScores.length);

  const improvedHeadline = buildHeadline(headline, found, target);
  const improvedSummary = buildSummary(summary, found, target);

  return {
    target_role: target,
    overall_score: overall,
    overall_summary: buildOverallSummary(overall, found, lower, target),
    sections: {
      headline: {
        score: headlineScore,
        summary:
          headlineScore >= 80
            ? "The headline is clear and role-focused, with enough context for recruiters to understand the profile quickly."
            : "The headline should communicate role, specialty, audience, and measurable value in one scannable line.",
        current: headline || "No clear headline detected.",
        improved: improvedHeadline,
      },
      summary: {
        score: summaryScore,
        summary:
          summaryScore >= 80
            ? "The About section gives useful context and enough detail to support a stronger first impression."
            : "The About section needs more narrative, proof, and keyword-rich detail to convert profile visits into conversations.",
        current: summary || "No About section detected.",
        improved: improvedSummary,
      },
      experience: {
        score: experienceScore,
        summary:
          experienceScore >= 80
            ? "The experience section includes enough role detail and signals of impact."
            : "Add measurable outcomes, scope, tools, and stronger action verbs to each role.",
      },
      education: {
        score: educationScore,
        summary:
          educationScore >= 75
            ? "Education is present and gives useful credibility context."
            : "Add degree, institution, dates, honors, certifications, or relevant coursework where appropriate.",
      },
      skills: {
        score: skillsScore,
        summary:
          skillsScore >= 80
            ? "The skills section has a useful keyword base for search and ATS matching."
            : "Broaden skills with role-specific tools, methods, and industry keywords recruiters search for.",
      },
      recommendations: {
        score: recommendationsScore,
        summary:
          recommendationsScore >= 75
            ? "Recommendations or social proof appear to be represented in the profile."
            : "Request 2-3 recommendations from managers, clients, or peers that validate results and collaboration style.",
      },
    },
    recommendations: buildRecommendations({
      headlineScore,
      summaryScore,
      experienceScore,
      educationScore,
      skillsScore,
      recommendationsScore,
      found,
      missing,
    }),
    keywords: {
      found: found.slice(0, 16),
      missing,
    },
    ats_tips: [
      target
        ? `Use "${target}" or a close variant in the headline and About section.`
        : "Use the exact job title and seniority level you want in the headline and About section.",
      "Mirror important job-description keywords naturally in experience bullets and skills.",
      "Put measurable business outcomes near the start of role descriptions.",
      "Spell out acronyms once before using abbreviated forms.",
      "Avoid dense paragraphs; use concise bullets for achievements, scope, and tools.",
      "Keep dates, company names, and role titles consistent with your resume.",
    ],
    checklist: [
      { label: "Clear current or target role in headline", completed: headlineScore >= 70 },
      { label: "About section explains value proposition", completed: summaryScore >= 70 },
      { label: "Experience includes measurable outcomes", completed: /%|\$|\b\d+x\b|\b\d+k\b|\b\d+m\b/.test(lower) },
      { label: "Skills include role-specific keywords", completed: found.length >= 6 },
      { label: "Education or credentials are present", completed: educationScore >= 65 },
      { label: "Recommendations or testimonials are represented", completed: recommendationsScore >= 65 },
      { label: "Profile includes cross-functional language", completed: lower.includes("cross-functional") || lower.includes("stakeholder") },
      { label: "Profile uses strong action verbs", completed: /(led|built|launched|managed|improved|increased|reduced|owned|delivered)/.test(lower) },
      { label: "Keyword density supports search visibility", completed: found.length >= 8 },
      { label: "Profile content is substantial enough for review", completed: profileText.length >= 900 },
    ],
  };
}

function extractTargetKeywords(targetRole) {
  if (!targetRole) return [];
  return targetRole
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2);
}

function buildHeadline(current, found, targetRole = "") {
  const roleBase = targetRole || current;
  const currentRole = roleBase && !roleBase.includes("No clear") ? roleBase.replace(/\s+/g, " ").slice(0, 80) : "Growth-Focused Professional";
  const specialties = found.slice(0, 3).map(formatKeyword);
  const specialtyText = specialties.length ? specialties.join(", ") : "Strategy, Execution, Measurable Results";
  return `${currentRole} | ${specialtyText} | Turning complex goals into measurable outcomes`;
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

function buildSummary(current, found, targetRole = "") {
  const keywordText = found.slice(0, 5).join(", ") || "strategy, collaboration, execution, and measurable impact";
  const targetSentence = targetRole ? ` I am targeting ${targetRole} opportunities where this background can create immediate value.` : "";
  const base =
    current && current.length > 120
      ? current.replace(/\s+/g, " ").slice(0, 220)
      : "I help teams translate ambitious goals into practical systems, strong execution, and measurable business results.";
  return `${base} My work blends ${keywordText} with clear communication, stakeholder alignment, and a bias for outcomes.${targetSentence} I am especially strong at clarifying priorities, building momentum across teams, and turning lessons from each project into repeatable operating habits.`;
}

function buildOverallSummary(score, found, lower, targetRole = "") {
  const keywordPhrase = found.length ? ` It already signals ${found.slice(0, 4).join(", ")}.` : "";
  const targetPhrase = targetRole ? ` for ${targetRole} roles` : "";
  if (score >= 82) {
    return `This is a strong LinkedIn profile${targetPhrase} with credible positioning and enough substance for recruiters to understand your value quickly.${keywordPhrase} The biggest opportunity is sharpening proof points so achievements feel unmistakable.`;
  }
  if (score >= 65) {
    return `This profile has a solid foundation${targetPhrase}, but a few sections need more specificity and measurable impact.${keywordPhrase} Improving the headline, About section, and role bullets would make the profile more discoverable and persuasive.`;
  }
  return `This profile needs clearer positioning${targetPhrase}, fuller section detail, and stronger keyword coverage before it will perform well in search or recruiter review.${lower.length > 500 ? keywordPhrase : ""} Start with headline clarity, About narrative, and quantified experience bullets.`;
}

function buildRecommendations(scores) {
  const items = [];
  if (scores.headlineScore < 75) {
    items.push({
      priority: "critical",
      text: "Rewrite the headline so it names your target role, specialty, audience, and measurable value.",
    });
  }
  if (scores.summaryScore < 75) {
    items.push({
      priority: "critical",
      text: "Expand the About section into 2-3 short paragraphs covering who you help, what problems you solve, and proof of impact.",
    });
  }
  if (scores.experienceScore < 80) {
    items.push({
      priority: "important",
      text: "Convert responsibility-heavy experience into achievement bullets with numbers, scope, tools, and outcomes.",
    });
  }
  if (scores.skillsScore < 78) {
    items.push({
      priority: "important",
      text: `Add role-specific skills such as ${scores.missing.slice(0, 5).join(", ")} if they accurately reflect your experience.`,
    });
  }
  if (scores.educationScore < 65) {
    items.push({
      priority: "nice_to_have",
      text: "Complete the education and credentials section with degree, institution, certifications, or relevant training.",
    });
  }
  if (scores.recommendationsScore < 65) {
    items.push({
      priority: "nice_to_have",
      text: "Ask trusted colleagues or clients for recommendations that mention outcomes, collaboration style, and expertise.",
    });
  }
  items.push(
    {
      priority: "important",
      text: "Repeat your top 5 target-role keywords across headline, About, experience, and skills without keyword stuffing.",
    },
    {
      priority: "nice_to_have",
      text: "Add featured links, portfolio work, case studies, or media that prove your expertise beyond text.",
    },
    {
      priority: "important",
      text: "Make the first three visible lines of your About section compelling enough to earn the click to read more.",
    }
  );
  return items.slice(0, 12);
}

export const base44 = {
  integrations: {
    Core: {
      async InvokeLLM({ prompt }) {
        const match = prompt.match(/PROFILE CONTENT:\s*([\s\S]*?)\n\nProvide a detailed analysis/i);
        const targetMatch = prompt.match(/TARGET ROLE:\s*([\s\S]*?)\n\nPROFILE CONTENT:/i);
        const profileText = match?.[1]?.trim() || prompt;
        const targetRole = targetMatch?.[1]?.trim();
        await wait(900);
        return analyzeProfileText(profileText, targetRole === "Not specified" ? "" : targetRole);
      },
    },
  },
};
