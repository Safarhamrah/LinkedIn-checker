import { useState } from "react";
import { motion } from "framer-motion";
import { Clipboard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BeforeAfter({ title, before, after, index = 0 }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = after || "";
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
      } else {
        fallbackCopy(text);
      }
    } catch {
      fallbackCopy(text);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="print-card overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="font-bold text-foreground">{title}</h3>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? <Check className="mr-1.5 h-4 w-4 text-emerald-400" /> : <Clipboard className="mr-1.5 h-4 w-4" />}
          {copied ? "Copied" : "Copy rewrite"}
        </Button>
      </div>
      <div className="grid md:grid-cols-2">
        <div className="border-b border-border p-5 md:border-b-0 md:border-r">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Current</span>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{before}</p>
        </div>
        <div className="bg-linkedin/5 p-5">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-linkedin-light">Improved</span>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{after}</p>
        </div>
      </div>
    </motion.div>
  );
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
