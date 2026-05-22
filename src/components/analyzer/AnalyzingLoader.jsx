import { motion } from "framer-motion";
import { Linkedin, Sparkles } from "lucide-react";

const steps = ["Reading sections", "Checking keywords", "Drafting fixes"];

export default function AnalyzingLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-linkedin to-linkedin-light shadow-2xl shadow-linkedin/25"
        >
          <Linkedin className="h-9 w-9 text-white" />
        </motion.div>
        <div className="mb-3 flex items-center justify-center gap-2 text-linkedin-light">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-bold uppercase tracking-[0.18em]">Analyzing</span>
        </div>
        <h1 className="text-3xl font-black text-foreground">Reading your profile</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Scoring sections, checking keyword coverage, and preparing fix-ready rewrites you can review before applying.
        </p>
        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0.35 }}
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.6, delay: index * 0.25, repeat: Infinity }}
              className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground"
            >
              {step}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
