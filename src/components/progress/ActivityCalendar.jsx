import { getActivityDays } from "@/lib/analysisHistory";

export default function ActivityCalendar() {
  const activity = getActivityDays();
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (41 - index));
    const key = date.toISOString().slice(0, 10);
    return { key, date, count: activity.get(key) || 0 };
  });

  return (
    <div className="h-full rounded-2xl border border-border bg-card p-5">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-foreground">Activity Calendar</h2>
        <p className="text-sm text-muted-foreground">Analysis activity from the past six weeks</p>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={day.key}
            title={`${day.key}: ${day.count} analyses`}
            className={`aspect-square rounded-lg border border-border transition-transform hover:scale-105 ${colorForCount(day.count)}`}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        {[0, 1, 2, 3].map((count) => (
          <span key={count} className={`h-3 w-3 rounded-sm border border-border ${colorForCount(count)}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

function colorForCount(count) {
  if (count >= 3) return "bg-linkedin";
  if (count === 2) return "bg-linkedin/70";
  if (count === 1) return "bg-linkedin/30";
  return "bg-muted/50";
}
