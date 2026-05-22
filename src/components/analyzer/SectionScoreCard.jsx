import { motion } from "framer-motion";
import { clampScore, cn } from "@/lib/utils";

export default function SectionScoreCard({ icon: Icon, title, score, summary, index = 0 }) {
  const safeScore = clampScore(score);
  const status =
    safeScore >= 80
      ? { label: "Strong", className: "bg-emerald-500/10 text-emerald-400" }
      : safeScore >= 65
        ? { label: "Promising", className: "bg-amber-500/10 text-amber-400" }
        : { label: "Needs work", className: "bg-red-500/10 text-red-400" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="print-card glass-panel rounded-2xl p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linkedin/10">
            <Icon className="h-5 w-5 text-linkedin-light" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">{title}</h3>
            <span className={cn("mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold", status.className)}>
              {status.label}
            </span>
          </div>
        </div>
        <span className="text-2xl font-black text-foreground">{safeScore}</span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safeScore}%` }}
          transition={{ delay: 0.2 + index * 0.05, duration: 0.7 }}
          className="h-full rounded-full bg-gradient-to-r from-linkedin to-linkedin-light"
        />
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
    </motion.div>
  );
}
