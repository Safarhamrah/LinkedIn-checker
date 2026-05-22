import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const priorityMap = {
  critical: {
    label: "Critical",
    icon: AlertTriangle,
    className: "border-red-500/25 bg-red-500/10 text-red-400",
  },
  important: {
    label: "Important",
    icon: CheckCircle2,
    className: "border-amber-500/25 bg-amber-500/10 text-amber-400",
  },
  nice_to_have: {
    label: "Nice to have",
    icon: Info,
    className: "border-linkedin/25 bg-linkedin/10 text-linkedin-light",
  },
};

export default function RecommendationItem({ recommendation, priority = "important", index = 0 }) {
  const meta = priorityMap[priority] || priorityMap.important;
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="print-card flex gap-3 rounded-2xl border border-border bg-card/75 p-4"
    >
      <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border", meta.className)}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{meta.label}</span>
        <p className="mt-1 text-sm leading-relaxed text-foreground">{recommendation}</p>
      </div>
    </motion.div>
  );
}
