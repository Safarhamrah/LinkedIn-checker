import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Briefcase,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Linkedin,
  Lock,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Star,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from "@/api/base44Client";
import ScoreGauge from "@/components/analyzer/ScoreGauge";
import SectionScoreCard from "@/components/analyzer/SectionScoreCard";
import RecommendationItem from "@/components/analyzer/RecommendationItem";
import BeforeAfter from "@/components/analyzer/BeforeAfter";
import ProfileChecklist from "@/components/analyzer/ProfileChecklist";
import KeywordsList from "@/components/analyzer/KeywordsList";
import ATSTips from "@/components/analyzer/ATSTips";
import AnalyzingLoader from "@/components/analyzer/AnalyzingLoader";
import ExportPdfButton from "@/components/analyzer/ExportPdfButton";
import JobFit from "@/components/analyzer/JobFit";
import SmartFixes from "@/components/analyzer/SmartFixes";
import ScoreExplanation from "@/components/analyzer/ScoreExplanation";
import { saveAnalysis } from "@/lib/analysisHistory";

const sectionIcons = {
  headline: User,
  summary: FileText,
  experience: Briefcase,
  education: GraduationCap,
  skills: Star,
  recommendations: Award,
};

export default function Results() {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const profileData = sessionStorage.getItem("linkedin_profile_data");
    if (!profileData) {
      navigate("/");
      return;
    }

    if (profileData === "history_mode") {
      const saved = sessionStorage.getItem("linkedin_saved_analysis");
      if (saved) {
        setAnalysis(JSON.parse(saved));
        setLoading(false);
      } else {
        navigate("/progress");
      }
      return;
    }

    analyzeProfile(profileData);
  }, [navigate]);

  const analyzeProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    const targetRole = sessionStorage.getItem("linkedin_target_role") || "";

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert LinkedIn profile consultant and career coach. Analyze the following LinkedIn profile content thoroughly and provide a comprehensive analysis.

TARGET ROLE:
${targetRole || "Not specified"}

PROFILE CONTENT:
${profileData}

Provide a detailed analysis in the following JSON structure. Be specific, actionable, and reference the actual content from the profile. If a section is missing or empty, note that and give it a lower score.`,
        model: "local_profile_analyzer",
      });

      const enrichedResult = { ...result, target_role: result.target_role || targetRole };
      setAnalysis(enrichedResult);
      const entry = saveAnalysis(profileData, enrichedResult, { targetRole });
      if (entry?.id) {
        sessionStorage.setItem("linkedin_analysis_entry_id", entry.id);
      }
    } catch (err) {
      const message = err?.message || String(err);
      setError(message.includes("limit") || message.includes("upgrade") || message.includes("plan") ? "monthly_limit" : "generic");
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = () => {
    navigate("/");
  };

  if (loading) return <AnalyzingLoader />;

  if (error) {
    const isLimit = error === "monthly_limit";
    const Icon = isLimit ? Lock : AlertTriangle;

    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
            <Icon className="h-8 w-8 text-amber-400" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-foreground">{isLimit ? "Monthly AI Limit Reached" : "Something went wrong"}</h2>
          <p className="mb-6 text-muted-foreground">
            {isLimit
              ? "This app has used up its AI integration credits for this month."
              : "An unexpected error occurred while analyzing your profile."}
          </p>
          <Button onClick={() => navigate("/")} className="bg-linkedin text-white hover:bg-linkedin-dark">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const sectionEntries = analysis.sections
    ? Object.entries(analysis.sections).filter(([, value]) => value && value.score !== undefined)
    : [];

  return (
    <div className="min-h-screen pb-20">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-muted-foreground">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-linkedin to-linkedin-light">
                <Linkedin className="h-4 w-4 text-white" />
              </div>
              <span className="hidden text-lg font-bold text-foreground sm:inline">ProfilePro</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportPdfButton analysis={analysis} username={sessionStorage.getItem("linkedin_username")} />
            <Button size="sm" variant="outline" onClick={handleReanalyze} className="hidden border-border text-muted-foreground hover:text-foreground sm:flex">
              <RefreshCw className="mr-1 h-4 w-4" />
              New Analysis
            </Button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">Your Profile Analysis</h1>
          <p className="mb-8 text-muted-foreground">Here's how your LinkedIn profile stacks up</p>
          <ScoreGauge score={analysis.overall_score || 0} />
          <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-muted-foreground">{analysis.overall_summary}</p>
        </motion.div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-8 flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-border bg-muted/50 p-1 sm:flex-nowrap sm:overflow-x-auto">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-linkedin data-[state=active]:text-white">
              <LayoutDashboard className="mr-1.5 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="improvements" className="rounded-lg data-[state=active]:bg-linkedin data-[state=active]:text-white">
              <MessageSquare className="mr-1.5 h-4 w-4" />
              Improvements
            </TabsTrigger>
            <TabsTrigger value="smartfixes" className="rounded-lg data-[state=active]:bg-linkedin data-[state=active]:text-white">
              <Sparkles className="mr-1.5 h-4 w-4" />
              Smart Fixes
            </TabsTrigger>
            <TabsTrigger value="keywords" className="rounded-lg data-[state=active]:bg-linkedin data-[state=active]:text-white">
              <Star className="mr-1.5 h-4 w-4" />
              Keywords & ATS
            </TabsTrigger>
            <TabsTrigger value="jobfit" className="rounded-lg data-[state=active]:bg-linkedin data-[state=active]:text-white">
              <Briefcase className="mr-1.5 h-4 w-4" />
              Job Fit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-8">
              <ScoreExplanation analysis={analysis} />

              <div>
                <h2 className="mb-5 text-xl font-bold text-foreground">Section Scores</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {sectionEntries.map(([key, section], index) => (
                    <SectionScoreCard
                      key={key}
                      icon={sectionIcons[key] || FileText}
                      title={key.charAt(0).toUpperCase() + key.slice(1)}
                      score={section.score}
                      summary={section.summary}
                      index={index}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-5 text-xl font-bold text-foreground">Recommendations</h2>
                <div className="space-y-3">
                  {(analysis.recommendations || []).map((recommendation, index) => (
                    <RecommendationItem
                      key={`${recommendation.text}-${index}`}
                      recommendation={recommendation.text}
                      priority={recommendation.priority}
                      index={index}
                    />
                  ))}
                </div>
              </div>

              {analysis.checklist && analysis.checklist.length > 0 && <ProfileChecklist items={analysis.checklist} />}
            </div>
          </TabsContent>

          <TabsContent value="improvements">
            <div className="space-y-6">
              <h2 className="mb-5 text-xl font-bold text-foreground">Before & After</h2>
              {analysis.sections?.headline?.improved && (
                <BeforeAfter title="Headline" before={analysis.sections.headline.current} after={analysis.sections.headline.improved} index={0} />
              )}
              {analysis.sections?.summary?.improved && (
                <BeforeAfter title="About / Summary" before={analysis.sections.summary.current} after={analysis.sections.summary.improved} index={1} />
              )}
              {!analysis.sections?.headline?.improved && !analysis.sections?.summary?.improved && (
                <div className="py-12 text-center text-muted-foreground">
                  <p>No section rewrites were generated. Try pasting more profile content.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="smartfixes">
            <SmartFixes analysis={analysis} entryId={sessionStorage.getItem("linkedin_analysis_entry_id")} />
          </TabsContent>

          <TabsContent value="keywords">
            <div className="grid gap-6 lg:grid-cols-2">
              {analysis.keywords && <KeywordsList found={analysis.keywords.found} missing={analysis.keywords.missing} analysis={analysis} />}
              {analysis.ats_tips && analysis.ats_tips.length > 0 && <ATSTips tips={analysis.ats_tips} />}
            </div>
          </TabsContent>

          <TabsContent value="jobfit">
            <JobFit analysis={analysis} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
