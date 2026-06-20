import { getDay, parseISO } from "date-fns";

import {
  activeDates,
  awardedPoints,
  getStreaks,
  totalPoints,
} from "./selectors";
import {
  compareLocalDates,
  daysBetween,
  daysInLocalDateRange,
  endOfConfiguredWeek,
  monthRange,
  shiftLocalDate,
  startOfConfiguredWeek,
  yearMonthFromDate,
} from "./dates";
import type {
  Activity,
  AppSettings,
  Artifact,
  DateRange,
  LocalDate,
  Track,
} from "./types";

export type TrendPoint = {
  label: string;
  from: LocalDate;
  to: LocalDate;
  activeDays: number;
  sessions: number;
  points: number;
};

export type ProjectInsight = {
  track: Track;
  sessions: number;
  points: number;
  targetSessions: number;
  completionRatio: number;
};

export type BehavioralTargetProgress = {
  label: string;
  current: number;
  target: number;
};

export type ProgressProjection = {
  activeDays: number;
  points: number;
  basisWeeks: number;
};

export type RecoveryInsight = {
  missedDays: number;
  recoveredNextDay: number;
  rate: number;
};

export type InsightsSummary = {
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  missedDays: number;
  recovery: RecoveryInsight;
  bestDayOfWeek?: { label: string; activeDays: number; points: number };
  mostProductiveTime?: { hour: number; sessions: number };
  projectInsights: ProjectInsight[];
  mostConsistentProject?: ProjectInsight;
  weakestProject?: ProjectInsight;
  weeklyTrend: TrendPoint[];
  monthlyTrend: TrendPoint[];
  artifactCount: number;
  artifactCountsByType: Array<{ type: string; count: number }>;
  behavioralTargets: BehavioralTargetProgress[];
  projection?: ProgressProjection;
};

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function buildInsightsSummary(input: {
  activities: Activity[];
  artifacts: Artifact[];
  tracks: Track[];
  settings: AppSettings;
  today: LocalDate;
}): InsightsSummary {
  const range = elapsedChallengeRange(input.settings, input.today);
  const elapsedActivities = input.activities.filter(
    (activity) => activity.date >= range.from && activity.date <= range.to,
  );
  const active = activeDates(elapsedActivities, input.tracks, range);
  const streaks = getStreaks(input.activities, input.tracks, input.settings, input.today);
  const projectInsights = buildProjectInsights(elapsedActivities, input.tracks, input.settings, range);
  const recovery = buildRecovery(active, range);
  const artifactCount = input.artifacts.filter((artifact) => artifact.status !== "archived").length;
  const summary: InsightsSummary = {
    activeDays: active.length,
    currentStreak: streaks.current,
    longestStreak: streaks.longest,
    totalPoints: totalPoints(elapsedActivities),
    missedDays: recovery.missedDays,
    recovery,
    projectInsights,
    weeklyTrend: buildWeeklyTrend(elapsedActivities, input.tracks, input.settings, range),
    monthlyTrend: buildMonthlyTrend(elapsedActivities, input.tracks, input.settings, range),
    artifactCount,
    artifactCountsByType: countArtifactsByType(input.artifacts),
    behavioralTargets: behavioralTargets(elapsedActivities, input.artifacts),
  };
  const bestDay = bestDayOfWeek(active, elapsedActivities);
  const productiveTime = mostProductiveTime(elapsedActivities);
  const mostConsistent = projectInsights[0];
  const weakest = [...projectInsights].reverse().find((project) => project.targetSessions > 0);
  const projection = buildProjection(input.activities, input.tracks, input.settings, input.today);
  if (bestDay) summary.bestDayOfWeek = bestDay;
  if (productiveTime) summary.mostProductiveTime = productiveTime;
  if (mostConsistent) summary.mostConsistentProject = mostConsistent;
  if (weakest) summary.weakestProject = weakest;
  if (projection) summary.projection = projection;
  return summary;
}

function elapsedChallengeRange(settings: AppSettings, today: LocalDate): DateRange {
  return {
    from: settings.challengeStartDate,
    to: compareLocalDates(today, settings.challengeEndDate) > 0 ? settings.challengeEndDate : today,
  };
}

function buildProjectInsights(
  activities: Activity[],
  tracks: Track[],
  settings: AppSettings,
  range: DateRange,
): ProjectInsight[] {
  const elapsedWeeks = Math.max(
    1,
    Math.ceil((daysBetween(range.from, range.to) + 1) / 7),
  );
  return tracks
    .filter((track) => track.status === "active" && track.weeklyTarget > 0)
    .map((track) => {
      const matching = activities.filter((activity) => activity.trackId === track.id);
      const targetSessions = track.weeklyTarget * elapsedWeeks;
      return {
        track,
        sessions: matching.length,
        points: totalPoints(matching),
        targetSessions,
        completionRatio: targetSessions > 0 ? matching.length / targetSessions : 0,
      };
    })
    .sort((left, right) => right.completionRatio - left.completionRatio || right.sessions - left.sessions);
}

function buildWeeklyTrend(
  activities: Activity[],
  tracks: Track[],
  settings: AppSettings,
  range: DateRange,
): TrendPoint[] {
  const weeks: TrendPoint[] = [];
  let cursor = startOfConfiguredWeek(range.from, settings.weekStartsOn);
  while (cursor <= range.to) {
    const week = {
      from: cursor,
      to: endOfConfiguredWeek(cursor, settings.weekStartsOn),
    };
    const bounded = { from: maxDate(week.from, range.from), to: minDate(week.to, range.to) };
    const matching = activities.filter((activity) => activity.date >= bounded.from && activity.date <= bounded.to);
    weeks.push({
      label: bounded.from,
      from: bounded.from,
      to: bounded.to,
      activeDays: activeDates(matching, tracks, bounded).length,
      sessions: matching.length,
      points: totalPoints(matching),
    });
    cursor = shiftLocalDate(cursor, 7);
  }
  return weeks;
}

function buildMonthlyTrend(
  activities: Activity[],
  tracks: Track[],
  settings: AppSettings,
  range: DateRange,
): TrendPoint[] {
  const months: TrendPoint[] = [];
  let cursor = yearMonthFromDate(range.from);
  const endMonth = yearMonthFromDate(range.to);
  while (cursor <= endMonth) {
    const month = monthRange(cursor);
    const bounded = { from: maxDate(month.from, range.from), to: minDate(month.to, range.to) };
    const matching = activities.filter((activity) => activity.date >= bounded.from && activity.date <= bounded.to);
    months.push({
      label: cursor,
      from: bounded.from,
      to: bounded.to,
      activeDays: activeDates(matching, tracks, bounded).length,
      sessions: matching.length,
      points: totalPoints(matching),
    });
    cursor = nextMonth(cursor);
  }
  void settings;
  return months;
}

function bestDayOfWeek(
  active: LocalDate[],
  activities: Activity[],
): InsightsSummary["bestDayOfWeek"] {
  if (active.length === 0) return undefined;
  const pointsByDate = new Map<LocalDate, number>();
  for (const activity of activities) {
    pointsByDate.set(activity.date, (pointsByDate.get(activity.date) ?? 0) + awardedPoints(activity));
  }
  const totals = DAY_LABELS.map((label) => ({ label, activeDays: 0, points: 0 }));
  for (const date of active) {
    const index = getDay(parseISO(`${date}T12:00:00Z`));
    const total = totals[index];
    if (!total) continue;
    total.activeDays += 1;
    total.points += pointsByDate.get(date) ?? 0;
  }
  return totals.sort((left, right) => right.activeDays - left.activeDays || right.points - left.points)[0];
}

function mostProductiveTime(activities: Activity[]): InsightsSummary["mostProductiveTime"] {
  const counts = new Map<number, number>();
  for (const activity of activities) {
    const hour = activityHour(activity);
    if (typeof hour === "number") counts.set(hour, (counts.get(hour) ?? 0) + 1);
  }
  if (counts.size === 0) return undefined;
  const top = [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0] - right[0])[0];
  if (!top) return undefined;
  const [hour, sessions] = top;
  return { hour, sessions };
}

function activityHour(activity: Activity): number | undefined {
  const value = activity.metadata?.completedAt ?? activity.metadata?.loggedAt ?? activity.metadata?.time;
  if (typeof value !== "string") return undefined;
  const match = value.match(/T(\d{2}):/) ?? value.match(/^(\d{2}):/);
  if (!match) return undefined;
  const hour = Number(match[1]);
  return hour >= 0 && hour <= 23 ? hour : undefined;
}

function buildRecovery(active: LocalDate[], range: DateRange): RecoveryInsight {
  const activeSet = new Set(active);
  let missedDays = 0;
  let recoveredNextDay = 0;
  for (const date of daysInLocalDateRange(range)) {
    if (activeSet.has(date)) continue;
    missedDays += 1;
    const next = shiftLocalDate(date, 1);
    if (next <= range.to && activeSet.has(next)) recoveredNextDay += 1;
  }
  return {
    missedDays,
    recoveredNextDay,
    rate: missedDays > 0 ? recoveredNextDay / missedDays : 0,
  };
}

function countArtifactsByType(artifacts: Artifact[]): InsightsSummary["artifactCountsByType"] {
  const counts = new Map<string, number>();
  for (const artifact of artifacts) {
    if (artifact.status === "archived") continue;
    counts.set(artifact.type, (counts.get(artifact.type) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((left, right) => right.count - left.count || left.type.localeCompare(right.type));
}

function behavioralTargets(
  activities: Activity[],
  artifacts: Artifact[],
): BehavioralTargetProgress[] {
  const nonArchived = artifacts.filter((artifact) => artifact.status !== "archived");
  const countTrack = (trackId: string) => activities.filter((activity) => activity.trackId === trackId).length;
  const countType = (type: Artifact["type"]) => nonArchived.filter((artifact) => artifact.type === type).length;
  return [
    { label: "English reps", current: countTrack("english"), target: 100 },
    { label: "Korean sessions", current: countTrack("korean"), target: 50 },
    { label: "Devlogs", current: countType("devlog"), target: 20 },
    { label: "Taste notes", current: countType("taste_note"), target: 20 },
    { label: "Conversation reflections", current: countType("conversation_reflection"), target: 20 },
    { label: "Vinance sessions", current: countTrack("vinance"), target: 100 },
    { label: "Weekly reviews", current: countType("weekly_review"), target: 20 },
    { label: "Monthly reviews", current: countType("monthly_review"), target: 6 },
    { label: "Artifacts created", current: nonArchived.length, target: 40 },
  ];
}

function buildProjection(
  activities: Activity[],
  tracks: Track[],
  settings: AppSettings,
  today: LocalDate,
): ProgressProjection | undefined {
  const currentWeekStart = startOfConfiguredWeek(today, settings.weekStartsOn);
  const completeWeeks: DateRange[] = [];
  let cursor = shiftLocalDate(currentWeekStart, -28);
  while (cursor < currentWeekStart) {
    const range = { from: cursor, to: endOfConfiguredWeek(cursor, settings.weekStartsOn) };
    if (range.to >= settings.challengeStartDate && range.to < today) {
      completeWeeks.push(range);
    }
    cursor = shiftLocalDate(cursor, 7);
  }
  const usableWeeks = completeWeeks.slice(-4);
  if (usableWeeks.length < 2) return undefined;
  const activeCounts = usableWeeks.map((range) =>
    activeDates(activities, tracks, range).length,
  );
  const pointCounts = usableWeeks.map((range) =>
    totalPoints(activities.filter((activity) => activity.date >= range.from && activity.date <= range.to)),
  );
  const remainingDays = Math.max(daysBetween(today, settings.challengeEndDate), 0);
  const remainingWeeks = remainingDays / 7;
  return {
    activeDays: Math.round(average(activeCounts) * remainingWeeks),
    points: Math.round(average(pointCounts) * remainingWeeks),
    basisWeeks: usableWeeks.length,
  };
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function maxDate(left: LocalDate, right: LocalDate): LocalDate {
  return left > right ? left : right;
}

function minDate(left: LocalDate, right: LocalDate): LocalDate {
  return left < right ? left : right;
}

function nextMonth(month: string): string {
  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7));
  const next = monthIndex === 12 ? { year: year + 1, month: 1 } : { year, month: monthIndex + 1 };
  return `${next.year}-${String(next.month).padStart(2, "0")}`;
}
