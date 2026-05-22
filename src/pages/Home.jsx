import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ClipboardCopy,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PdfUpload from "@/components/analyzer/PdfUpload";
import Navbar from "@/components/layout/Navbar";
import { useTheme } from "@/lib/useTheme";

const features = [
  {
    icon: Target,
    title: "Profile Scoring",
    description: "Get a detailed 0-100 score with section-by-section breakdown of your profile strength.",
  },
  {
    icon: TrendingUp,
    title: "AI-Powered Rewrites",
    description: "Receive improved versions of your headline, summary, and key sections you can copy instantly.",
  },
  {
    icon: Shield,
    title: "ATS Optimization",
    description: "Ensure your profile passes Applicant Tracking Systems with keyword analysis and tips.",
  },
];

const steps = [
  {
    num: "01",
    title: "Go to your LinkedIn profile",
    description: "Open LinkedIn, navigate to your profile page, and select all text.",
  },
  {
    num: "02",
    title: "Copy your profile content",
    description: "Copy everything: headline, about, experience, education, and skills.",
  },
  {
    num: "03",
    title: "Paste it below",
    description: "Paste the copied content into the text area and click Analyze.",
  },
];

const SAMPLE_PROFILE = `Alex Morgan
Product Manager at BrightLabs
Denver, Colorado, United States

About
Product leader with 7 years of experience launching B2B SaaS workflow tools. I enjoy working with design, engineering, sales, and customer success to solve customer problems, but my summary is brief and does not clearly show measurable outcomes.

Experience
Product Manager, BrightLabs
Led roadmap planning for a collaboration analytics product. Partnered with engineering to ship onboarding improvements. Worked with customers and sales teams to prioritize requirements.

Associate Product Manager, Northstar Software
Supported feature launches, wrote product requirements, and analyzed customer feedback.

Skills
Product strategy, roadmaps, user research, analytics, stakeholder management, agile, SaaS, AI, SQL.

Education
University of Colorado Boulder, B.S. Business Administration.`;

export default function Home() {
  const [profileData, setProfileData] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [toast, setToast] = useState("");
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleAnalyze = () => {
    if (!profileData.trim()) return;
    sessionStorage.setItem("linkedin_profile_data", profileData);
    if (targetRole.trim()) {
      sessionStorage.setItem("linkedin_target_role", targetRole.trim());
    } else {
      sessionStorage.removeItem("linkedin_target_role");
    }
    sessionStorage.removeItem("linkedin_saved_analysis");
    sessionStorage.removeItem("linkedin_analysis_entry_id");
    navigate("/results");
  };

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  };

  const handleUseSample = () => {
    setTargetRole("Senior Product Manager");
    setProfileData(SAMPLE_PROFILE);
    showToast("Sample profile loaded");
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed left-1/2 top-20 z-[100] flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-500/30"
          >
            <CheckCircle2 className="h-4 w-4" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <section className="relative overflow-hidden px-4 pb-20 pt-20 sm:px-6 lg:pt-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-12 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-linkedin/10 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[22rem] w-[22rem] rounded-full bg-emerald-500/10 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-linkedin/20 bg-linkedin/10 px-4 py-1.5 text-sm font-medium text-linkedin-light">
              <Sparkles className="h-4 w-4" />
              AI-Powered Profile Analysis
            </div>
          </motion.div>

          <motion.h1
            className="mb-6 text-4xl font-black leading-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Make Your LinkedIn
            <br />
            <span className="bg-gradient-to-r from-linkedin to-linkedin-light bg-clip-text text-transparent">Stand Out</span>
          </motion.h1>

          <motion.p
            className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Get a detailed analysis of your LinkedIn profile with AI-powered scoring, personalized improvement suggestions, and ready-to-use rewrites.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <Button
              size="lg"
              className="rounded-xl bg-gradient-to-r from-linkedin to-linkedin-light px-8 py-6 text-lg text-white shadow-lg shadow-linkedin/20 hover:opacity-90"
              onClick={() => document.getElementById("input-section")?.scrollIntoView({ behavior: "smooth" })}
            >
              Analyze My Profile
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          <motion.div className="mt-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <ChevronDown className="mx-auto h-6 w-6 animate-bounce text-muted-foreground" />
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-linkedin/30"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-linkedin/10">
                  <feature.icon className="h-6 w-6 text-linkedin-light" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="input-section" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">How It Works</h2>
            <p className="text-muted-foreground">Three simple steps to a better profile</p>
          </motion.div>

          <div className="mb-12 grid gap-6 sm:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className="text-center sm:text-left"
              >
                <span className="text-3xl font-black text-linkedin/30">{step.num}</span>
                <h4 className="mb-1 mt-2 font-semibold text-foreground">{step.title}</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card p-6 sm:p-8"
          >
            <div className="mb-4 flex items-center gap-2">
              <ClipboardCopy className="h-5 w-5 text-linkedin-light" />
              <h3 className="font-semibold text-foreground">Paste Your LinkedIn Profile</h3>
            </div>
            <p className="mb-5 text-sm text-muted-foreground">
              Go to your LinkedIn profile, select all, copy, and paste below. Include headline, about, experience, education, skills, and recommendations when available.
            </p>
            <div className="mb-5">
              <label htmlFor="target-role" className="mb-2 block text-sm font-semibold text-foreground">
                Target role
              </label>
              <input
                id="target-role"
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
                placeholder="Example: Senior Product Manager, Data Analyst, Account Executive"
                className="h-11 w-full rounded-xl border border-input bg-muted/50 px-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-linkedin focus:ring-2 focus:ring-linkedin"
              />
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Optional, but recommended. The analysis and Smart Fixes tune keywords, tone, and rewrites toward this role.
              </p>
            </div>
            <Textarea
              placeholder={"Paste your LinkedIn profile content here...\n\nExample:\nJohn Smith\nSenior Software Engineer at Google\nSan Francisco Bay Area\n\nAbout\nPassionate software engineer with 8+ years of experience..."}
              value={profileData}
              onChange={(event) => setProfileData(event.target.value)}
              className="min-h-[250px] resize-none border-border bg-muted/50 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:border-linkedin focus:ring-linkedin"
            />

            <PdfUpload onTextExtracted={(text) => setProfileData((previous) => (previous ? `${previous}\n\n${text}` : text))} onToast={showToast} />

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Privacy note: this demo keeps your profile text, saved reports, and optimized drafts in this browser's local storage unless you export or clear them.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-muted-foreground">
                {profileData.length > 0 ? `${profileData.length} characters` : "Minimum 100 characters recommended"}
              </span>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" size="lg" onClick={handleUseSample} className="rounded-xl border-linkedin/30 text-linkedin-light hover:bg-linkedin/10">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Try sample profile
                </Button>
                <Button
                  size="lg"
                  disabled={profileData.trim().length < 50}
                  onClick={handleAnalyze}
                  className="rounded-xl bg-gradient-to-r from-linkedin to-linkedin-light px-8 text-white shadow-lg shadow-linkedin/20 hover:opacity-90 disabled:shadow-none"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Analyze Profile
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-linkedin to-linkedin-light">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-muted-foreground">ProfilePro</span>
          </div>
          <p className="text-xs text-muted-foreground">AI-powered LinkedIn profile optimization</p>
        </div>
      </footer>
    </div>
  );
}
