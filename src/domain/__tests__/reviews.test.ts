import { canCompleteWeeklyReview, weeklyReviewSummary } from "../reviews";
import type { AppSettings } from "../types";
import { buildActivity, buildTrack } from "../../test/builders";

const settings: AppSettings = {
  id: "app",
  challengeStartDate: "2026-06-01",
  challengeEndDate: "2026-12-31",
  weekStartsOn: "monday",
  locale: "en-US",
  timeZone: "UTC",
  theme: "system",
  weeklyThresholds: { minimumWin: 15, goodWeek: 22, excellentWeek: 28 },
  reminders: { enabled: false },
  updatedAt: "2026-06-01T00:00:00.000Z",
};

describe("weekly reviews", () => {
  it("allows completion only after the week ends", () => {
    expect(canCompleteWeeklyReview("2026-06-14", "2026-06-14")).toBe(false);
    expect(canCompleteWeeklyReview("2026-06-14", "2026-06-15")).toBe(true);
  });

  it("derives summary and deterministic strongest/weakest tracks", () => {
    const english = buildTrack({ id: "english", weeklyTarget: 2, sortOrder: 1 });
    const korean = buildTrack({
      id: "korean",
      slug: "korean",
      name: "Korean",
      weeklyTarget: 2,
      sortOrder: 2,
    });
    const summary = weeklyReviewSummary({
      range: { from: "2026-06-08", to: "2026-06-14" },
      activities: [
        buildActivity({ id: "one", trackId: "english", date: "2026-06-08" }),
        buildActivity({ id: "two", trackId: "english", date: "2026-06-09" }),
        buildActivity({ id: "three", trackId: "korean", date: "2026-06-09" }),
      ],
      artifacts: [],
      tracks: [english, korean],
      settings,
    });
    expect(summary.activeDays).toBe(2);
    expect(summary.points).toBe(6);
    expect(summary.strongestTrack?.id).toBe("english");
    expect(summary.weakestTrack?.id).toBe("korean");
  });
});
