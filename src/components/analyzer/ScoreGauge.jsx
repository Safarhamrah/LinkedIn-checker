import { motion } from "framer-motion";
import { clampScore } from "@/lib/utils";

export default function ScoreGauge({ score = 0 }) {
  const safeScore = clampScore(score);
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;
  const color = safeScore >= 80 ? "#22c55e" : safeScore >= 65 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative mx-auto h-48 w-48">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="18" />
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="18"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black text-foreground">{safeScore}</span>
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Score</span>
      </div>
    </div>
  );
}
