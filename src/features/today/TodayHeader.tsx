import { CheckCircle2, Circle } from "lucide-react";

import { StatusBadge } from "../../components/StatusBadge";

export function TodayHeader({
  date,
  todayActive,
  currentStreak,
  longestStreak,
}: {
  date: string;
  todayActive: boolean;
  currentStreak: number;
  longestStreak: number;
}) {
  const formatted = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));

  return (
    <header className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">
          {formatted}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {todayActive ? "Today is non-zero." : "Make today count."}
        </h1>
        <div className="mt-3 flex items-center gap-2 text-muted">
          {todayActive ? (
            <CheckCircle2 className="text-brand" size={20} />
          ) : (
            <Circle size={20} />
          )}
          <span>
            {todayActive
              ? "You completed a meaningful action."
              : "One completed action is enough to win the day."}
          </span>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="min-w-28 rounded-2xl border border-line bg-surface p-4">
          <StatusBadge tone={currentStreak > 0 ? "positive" : "neutral"}>
            Current
          </StatusBadge>
          <p className="mt-2 font-display text-3xl font-semibold">
            {currentStreak}
          </p>
          <p className="text-xs text-muted">day streak</p>
        </div>
        <div className="min-w-28 rounded-2xl border border-line bg-surface p-4">
          <StatusBadge>Longest</StatusBadge>
          <p className="mt-2 font-display text-3xl font-semibold">
            {longestStreak}
          </p>
          <p className="text-xs text-muted">days</p>
        </div>
      </div>
    </header>
  );
}
