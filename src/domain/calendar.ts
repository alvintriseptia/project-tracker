import {
  compareLocalDates,
  daysInLocalDateRange,
  isWithinRange,
  monthRange,
  shiftLocalDate,
  startOfConfiguredWeek,
} from "./dates";
import { awardedPoints } from "./selectors";
import type {
  Activity,
  DateRange,
  LocalDate,
  Track,
  YearMonth,
} from "./types";

export type CalendarDayState =
  | "active"
  | "missed"
  | "future"
  | "out_of_range"
  | "empty";

export type CalendarDay = {
  date: LocalDate;
  inMonth: boolean;
  isToday: boolean;
  state: CalendarDayState;
  points: number;
  trackIds: string[];
  activities: Activity[];
};

export function calendarGridRange(
  month: YearMonth,
  weekStartsOn: "monday" | "sunday",
): DateRange {
  const monthDates = monthRange(month);
  const from = startOfConfiguredWeek(monthDates.from, weekStartsOn);
  const endWeekStart = startOfConfiguredWeek(monthDates.to, weekStartsOn);
  return { from, to: shiftLocalDate(endWeekStart, 6) };
}

export function projectCalendarDays(input: {
  month: YearMonth;
  weekStartsOn: "monday" | "sunday";
  today: LocalDate;
  challengeRange: DateRange;
  activities: Activity[];
  tracks: Track[];
  trackId?: string;
}): CalendarDay[] {
  const gridRange = calendarGridRange(input.month, input.weekStartsOn);
  const tracksById = new Map(input.tracks.map((track) => [track.id, track]));

  return daysInLocalDateRange(gridRange).map((date) => {
    const activities = input.activities.filter(
      (activity) =>
        activity.date === date &&
        (!input.trackId || activity.trackId === input.trackId),
    );
    const qualifying = activities.filter((activity) => {
      const track = tracksById.get(activity.trackId);
      return input.trackId ? Boolean(track) : Boolean(track?.countsTowardNoZero);
    });
    const inRange = isWithinRange(date, input.challengeRange);
    const future = compareLocalDates(date, input.today) > 0;
    const state: CalendarDayState = !inRange
      ? "out_of_range"
      : future
        ? "future"
        : qualifying.length > 0
          ? "active"
          : compareLocalDates(date, input.today) < 0
            ? "missed"
            : "empty";
    return {
      date,
      inMonth: date.startsWith(input.month),
      isToday: date === input.today,
      state,
      points: activities.reduce(
        (total, activity) => total + awardedPoints(activity),
        0,
      ),
      trackIds: [...new Set(activities.map((activity) => activity.trackId))],
      activities,
    };
  });
}
