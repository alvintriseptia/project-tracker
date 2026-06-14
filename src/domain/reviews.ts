import { compareLocalDates } from "./dates";
import {
  activitiesInRange,
  totalPoints,
  weeklyStatus,
  weeklyTrackProgress,
} from "./selectors";
import type {
  Activity,
  AppSettings,
  Artifact,
  DateRange,
  LocalDate,
  Track,
} from "./types";

export function weeklyReviewKey(weekStart: LocalDate): string {
  return `weekly:${weekStart}`;
}

export function monthlyReviewKey(month: string): string {
  return `monthly:${month}`;
}

export function canCompleteWeeklyReview(
  weekEnd: LocalDate,
  today: LocalDate,
): boolean {
  return compareLocalDates(today, weekEnd) > 0;
}

export function weeklyReviewSummary(input: {
  range: DateRange;
  activities: Activity[];
  artifacts: Artifact[];
  tracks: Track[];
  settings: AppSettings;
}) {
  const weeklyActivities = activitiesInRange(input.activities, input.range);
  const weeklyArtifacts = input.artifacts.filter(
    (artifact) =>
      artifact.status !== "archived" &&
      artifact.date >= input.range.from &&
      artifact.date <= input.range.to,
  );
  const progress = weeklyTrackProgress(
    input.activities,
    input.tracks,
    input.range,
  );
  const activeDays = new Set(weeklyActivities.map((activity) => activity.date))
    .size;
  const points = totalPoints(weeklyActivities);
  const ranked = [...progress].sort((left, right) => {
    const leftRatio = left.target === 0 ? 0 : left.completed / left.target;
    const rightRatio = right.target === 0 ? 0 : right.completed / right.target;
    return (
      rightRatio - leftRatio ||
      right.completed - left.completed ||
      left.track.sortOrder - right.track.sortOrder
    );
  });
  return {
    activities: weeklyActivities,
    artifacts: weeklyArtifacts,
    activeDays,
    points,
    status: weeklyStatus(points, input.settings.weeklyThresholds),
    progress,
    strongestTrack: ranked[0]?.track,
    weakestTrack: ranked.at(-1)?.track,
  };
}
