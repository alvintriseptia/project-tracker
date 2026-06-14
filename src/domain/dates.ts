import { addDays, differenceInCalendarDays, getDay, parseISO } from "date-fns";

import type { DateRange, LocalDate } from "./types";

const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isLocalDate(value: string): boolean {
  if (!LOCAL_DATE_PATTERN.test(value)) {
    return false;
  }

  const parsed = parseISO(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function assertLocalDate(value: string): asserts value is LocalDate {
  if (!isLocalDate(value)) {
    throw new Error(`Invalid local date: ${value}`);
  }
}

export function toLocalDate(date: Date, timeZone: string): LocalDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const valueFor = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  const year = valueFor("year");
  const month = valueFor("month");
  const day = valueFor("day");
  if (!year || !month || !day) {
    throw new Error(`Unable to format a local date for ${timeZone}.`);
  }
  const value = `${year}-${month}-${day}`;
  assertLocalDate(value);
  return value;
}

export function todayInTimeZone(timeZone: string, now = new Date()): LocalDate {
  return toLocalDate(now, timeZone);
}

export function shiftLocalDate(date: LocalDate, amount: number): LocalDate {
  assertLocalDate(date);
  const shifted = addDays(parseISO(`${date}T12:00:00Z`), amount)
    .toISOString()
    .slice(0, 10);
  assertLocalDate(shifted);
  return shifted;
}

export function compareLocalDates(left: LocalDate, right: LocalDate): number {
  return left.localeCompare(right);
}

export function clampLocalDate(date: LocalDate, range: DateRange): LocalDate {
  if (compareLocalDates(date, range.from) < 0) {
    return range.from;
  }
  if (compareLocalDates(date, range.to) > 0) {
    return range.to;
  }
  return date;
}

export function daysBetween(from: LocalDate, to: LocalDate): number {
  return differenceInCalendarDays(
    parseISO(`${to}T12:00:00Z`),
    parseISO(`${from}T12:00:00Z`),
  );
}

export function startOfConfiguredWeek(
  date: LocalDate,
  weekStartsOn: "monday" | "sunday",
): LocalDate {
  const day = getDay(parseISO(`${date}T12:00:00Z`));
  const offset = weekStartsOn === "sunday" ? day : (day + 6) % 7;
  return shiftLocalDate(date, -offset);
}

export function endOfConfiguredWeek(
  date: LocalDate,
  weekStartsOn: "monday" | "sunday",
): LocalDate {
  return shiftLocalDate(startOfConfiguredWeek(date, weekStartsOn), 6);
}

export function isWithinRange(date: LocalDate, range: DateRange): boolean {
  return (
    compareLocalDates(date, range.from) >= 0 &&
    compareLocalDates(date, range.to) <= 0
  );
}

export function daysInLocalDateRange(range: DateRange): LocalDate[] {
  const dates: LocalDate[] = [];
  let cursor = range.from;
  while (compareLocalDates(cursor, range.to) <= 0) {
    dates.push(cursor);
    cursor = shiftLocalDate(cursor, 1);
  }
  return dates;
}

export function yearMonthFromDate(date: LocalDate): string {
  assertLocalDate(date);
  return date.slice(0, 7);
}

export function monthRange(month: string): DateRange {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new Error(`Invalid year month: ${month}`);
  }
  const first = `${month}-01`;
  assertLocalDate(first);
  const nextMonthDate = addDays(
    new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 1)),
    -1,
  )
    .toISOString()
    .slice(0, 10);
  assertLocalDate(nextMonthDate);
  return { from: first, to: nextMonthDate };
}
