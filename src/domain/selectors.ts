import {
  clampLocalDate,
  compareLocalDates,
  endOfConfiguredWeek,
  isWithinRange,
  shiftLocalDate,
  startOfConfiguredWeek,
} from "./dates";
import type {
  Activity,
  AppSettings,
  DateRange,
  LocalDate,
  Track,
} from "./types";

export type WeeklyStatus =
  | "failed"
  | "minimum_win"
  | "good_week"
  | "excellent_week";

export type TrackProgress = {
  track: Track;
  completed: number;
  remaining: number;
  target: number;
};

export function qualifyingActivities(
  activities: readonly Activity[],
  tracks: readonly Track[],
  range: DateRange,
): Activity[] {
  const tracksById = new Map(tracks.map((track) => [track.id, track]));
  return activities.filter((activity) => {
    const track = tracksById.get(activity.trackId);
    return Boolean(track?.countsTowardNoZero) && isWithinRange(activity.date, range);
  });
}

export function activeDates(
  activities: readonly Activity[],
  tracks: readonly Track[],
  range: DateRange,
): LocalDate[] {
  return [
    ...new Set(
      qualifyingActivities(activities, tracks, range).map(
        (activity) => activity.date,
      ),
    ),
  ].sort(compareLocalDates);
}

export function getStreaks(
  activities: readonly Activity[],
  tracks: readonly Track[],
  settings: AppSettings,
  today: LocalDate,
): {
  current: number;
  longest: number;
  lastCompletedDate?: LocalDate;
  todayActive: boolean;
} {
  const challengeRange = {
    from: settings.challengeStartDate,
    to: settings.challengeEndDate,
  };
  const dates = activeDates(activities, tracks, challengeRange);
  const dateSet = new Set(dates);
  const evaluationDate = clampLocalDate(today, challengeRange);
  const todayActive =
    isWithinRange(today, challengeRange) && dateSet.has(today);
  let cursor = todayActive ? evaluationDate : shiftLocalDate(evaluationDate, -1);
  let current = 0;

  while (
    compareLocalDates(cursor, settings.challengeStartDate) >= 0 &&
    dateSet.has(cursor)
  ) {
    current += 1;
    cursor = shiftLocalDate(cursor, -1);
  }

  let longest = 0;
  let run = 0;
  let previous: LocalDate | undefined;
  for (const date of dates) {
    run = previous && shiftLocalDate(previous, 1) === date ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = date;
  }

  const lastCompletedDate = dates.at(-1);
  return {
    current,
    longest,
    ...(lastCompletedDate ? { lastCompletedDate } : {}),
    todayActive,
  };
}

export function weekRange(
  date: LocalDate,
  settings: Pick<AppSettings, "weekStartsOn">,
): DateRange {
  return {
    from: startOfConfiguredWeek(date, settings.weekStartsOn),
    to: endOfConfiguredWeek(date, settings.weekStartsOn),
  };
}

export function activitiesInRange(
  activities: readonly Activity[],
  range: DateRange,
): Activity[] {
  return activities.filter((activity) => isWithinRange(activity.date, range));
}

export function awardedPoints(activity: Activity): number {
  return activity.points + activity.bonusPoints;
}

export function totalPoints(activities: readonly Activity[]): number {
  return activities.reduce((total, activity) => total + awardedPoints(activity), 0);
}

export function weeklyStatus(
  points: number,
  thresholds: AppSettings["weeklyThresholds"],
): WeeklyStatus {
  if (points < thresholds.minimumWin) return "failed";
  if (points < thresholds.goodWeek) return "minimum_win";
  if (points < thresholds.excellentWeek) return "good_week";
  return "excellent_week";
}

export function weeklyTrackProgress(
  activities: readonly Activity[],
  tracks: readonly Track[],
  range: DateRange,
): TrackProgress[] {
  const weekly = activitiesInRange(activities, range);
  return tracks
    .filter((track) => track.status === "active" && track.weeklyTarget > 0)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((track) => {
      const completed = weekly.filter(
        (activity) => activity.trackId === track.id,
      ).length;
      return {
        track,
        completed,
        target: track.weeklyTarget,
        remaining: Math.max(track.weeklyTarget - completed, 0),
      };
    });
}

export function trackTotals(
  activities: readonly Activity[],
  trackId: string,
): { sessions: number; points: number } {
  const matching = activities.filter((activity) => activity.trackId === trackId);
  return { sessions: matching.length, points: totalPoints(matching) };
}
