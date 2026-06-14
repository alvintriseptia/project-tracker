import { getStreaks, weeklyStatus, weeklyTrackProgress } from "../selectors";
import type { Activity, AppSettings, Track } from "../types";

const instant = "2026-06-14T00:00:00.000Z";

const settings: AppSettings = {
  id: "app",
  challengeStartDate: "2026-06-01",
  challengeEndDate: "2026-12-31",
  weekStartsOn: "monday",
  locale: "en-US",
  timeZone: "Asia/Jakarta",
  theme: "system",
  weeklyThresholds: { minimumWin: 15, goodWeek: 22, excellentWeek: 28 },
  reminders: { enabled: false },
  updatedAt: instant,
};

const track: Track = {
  id: "english",
  slug: "english",
  name: "English",
  description: "",
  icon: "Languages",
  color: "#176b4d",
  status: "active",
  sortOrder: 1,
  defaultPoints: 2,
  weeklyTarget: 3,
  minimumAction: "Speak",
  normalAction: "Practice",
  strongAction: "Explain",
  countsTowardNoZero: true,
  createdAt: instant,
  updatedAt: instant,
};

function activity(id: string, date: string): Activity {
  return {
    id,
    date,
    trackId: "english",
    level: "minimum",
    title: "Practice",
    points: 2,
    bonusPoints: 0,
    tags: [],
    artifactIds: [],
    createdAt: instant,
    updatedAt: instant,
  };
}

describe("streak selectors", () => {
  it("keeps yesterday's streak visible until the current day ends", () => {
    const result = getStreaks(
      [
        activity("1", "2026-06-11"),
        activity("2", "2026-06-12"),
        activity("3", "2026-06-13"),
      ],
      [track],
      settings,
      "2026-06-14",
    );
    expect(result).toMatchObject({ current: 3, longest: 3, todayActive: false });
  });

  it("recalculates runs after a deleted day", () => {
    const result = getStreaks(
      [activity("1", "2026-06-11"), activity("3", "2026-06-13")],
      [track],
      settings,
      "2026-06-14",
    );
    expect(result.current).toBe(1);
    expect(result.longest).toBe(1);
  });

  it("ignores non-qualifying tracks", () => {
    const result = getStreaks(
      [activity("1", "2026-06-14")],
      [{ ...track, countsTowardNoZero: false }],
      settings,
      "2026-06-14",
    );
    expect(result.todayActive).toBe(false);
  });
});

describe("weekly selectors", () => {
  it("maps points to configured status thresholds", () => {
    expect(weeklyStatus(14, settings.weeklyThresholds)).toBe("failed");
    expect(weeklyStatus(15, settings.weeklyThresholds)).toBe("minimum_win");
    expect(weeklyStatus(22, settings.weeklyThresholds)).toBe("good_week");
    expect(weeklyStatus(28, settings.weeklyThresholds)).toBe("excellent_week");
  });

  it("counts sessions and excludes archived targets", () => {
    const progress = weeklyTrackProgress(
      [activity("1", "2026-06-08"), activity("2", "2026-06-09")],
      [track, { ...track, id: "old", status: "archived" }],
      { from: "2026-06-08", to: "2026-06-14" },
    );
    expect(progress).toHaveLength(1);
    expect(progress[0]).toMatchObject({ completed: 2, remaining: 1, target: 3 });
  });
});
