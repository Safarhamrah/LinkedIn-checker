import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/useTheme";
import Navbar from "@/components/layout/Navbar";
import ScoreGrowthChart from "@/components/progress/ScoreGrowthChart";
import SavedReportsList from "@/components/progress/SavedReportsList";
import ActivityCalendar from "@/components/progress/ActivityCalendar";
import ActivitySummary from "@/components/progress/ActivitySummary";
import { clearHistory, getHistory } from "@/lib/analysisHistory";

export default function Progress() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [history, setHistory] = useState(getHistory);
  const [activityKey, setActivityKey] = useState(0);

  const refresh = () => {
    setHistory(getHistory());
    setActivityKey((key) => key + 1);
  };

  const handleSelect = (entry) => {
    sessionStorage.setItem("linkedin_profile_data", "history_mode");
    sessionStorage.setItem("linkedin_username", entry.username || "LinkedIn User");
    sessionStorage.setItem("linkedin_profile_url", entry.profileUrl || "");
    sessionStorage.setItem("linkedin_analysis_entry_id", entry.id);
    if (entry.targetRole || entry.analysis?.target_role) {
      sessionStorage.setItem("linkedin_target_role", entry.targetRole || entry.analysis.target_role);
    } else {
      sessionStorage.removeItem("linkedin_target_role");
    }
    sessionStorage.setItem("linkedin_saved_analysis", JSON.stringify(entry.analysis));
    navigate("/results");
  };

  const handleClearAll = () => {
    clearHistory();
    refresh();
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <div className="mb-1 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linkedin/10">
                <BarChart2 className="h-5 w-5 text-linkedin-light" />
              </div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Progress Tracker</h1>
            </div>
            <p className="text-sm text-muted-foreground sm:ml-12">Track your profile growth and networking activity</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-linkedin to-linkedin-light text-white shadow-lg shadow-linkedin/20 hover:opacity-90">
              <Plus className="mr-1.5 h-4 w-4" />
              New Analysis
            </Button>
            {history.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearAll} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Clear History
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <ScoreGrowthChart history={history} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 grid gap-6 lg:grid-cols-3"
        >
          <div className="lg:col-span-2">
            <ActivityCalendar key={activityKey} />
          </div>
          <div>
            <ActivitySummary key={activityKey} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="mb-4 text-lg font-bold text-foreground">Saved Reports</h2>
          <SavedReportsList history={history} onSelect={handleSelect} onDelete={refresh} />
        </motion.div>
      </div>
    </div>
  );
}
