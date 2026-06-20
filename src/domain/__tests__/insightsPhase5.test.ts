import { buildInsightsSummary } from "../insights";
import type { AppSettings } from "../types";
import { buildActivity, buildArtifact, buildTrack } from "../../test/builders";

const timestamp = "2026-06-14T00:00:00.000Z";

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
  updatedAt: timestamp,
};

describe("buildInsightsSummary", () => {
  it("calculates project consistency, target progress, recovery, and artifact counts", () => {
    const tracks = [
      buildTrack({ id: "english", slug: "english", name: "English", weeklyTarget: 2 }),
      buildTrack({ id: "korean", slug: "korean", name: "Korean", weeklyTarget: 2 }),
    ];
    const summary = buildInsightsSummary({
      activities: [
        buildActivity({ id: "a1", date: "2026-06-01", trackId: "english", points: 2 }),
        buildActivity({ id: "a2", date: "2026-06-02", trackId: "english", points: 2 }),
        buildActivity({ id: "a3", date: "2026-06-04", trackId: "korean", points: 3 }),
      ],
      artifacts: [
        buildArtifact({ id: "devlog-1", type: "devlog", status: "published" }),
        buildArtifact({ id: "taste-1", type: "taste_note", status: "completed" }),
        buildArtifact({ id: "archived", type: "custom", status: "archived" }),
      ],
      tracks,
      settings,
      today: "2026-06-05",
    });

    expect(summary.activeDays).toBe(3);
    expect(summary.missedDays).toBe(2);
    expect(summary.recovery.recoveredNextDay).toBe(1);
    expect(summary.artifactCount).toBe(2);
    expect(summary.artifactCountsByType).toEqual([
      { type: "devlog", count: 1 },
      { type: "taste_note", count: 1 },
    ]);
    expect(summary.mostConsistentProject?.track.id).toBe("english");
    expect(summary.weakestProject?.track.id).toBe("korean");
    expect(summary.behavioralTargets.find((target) => target.label === "Devlogs")).toMatchObject({
      current: 1,
      target: 20,
    });
  });

  it("suppresses projection until at least two complete weeks exist", () => {
    const summary = buildInsightsSummary({
      activities: [buildActivity({ date: "2026-06-01" })],
      artifacts: [],
      tracks: [buildTrack()],
      settings,
      today: "2026-06-08",
    });

    expect(summary.projection).toBeUndefined();
  });

  it("uses trailing complete weeks for end-of-year projection", () => {
    const activities = [
      buildActivity({ id: "w1-a", date: "2026-06-01", points: 2 }),
      buildActivity({ id: "w1-b", date: "2026-06-02", points: 2 }),
      buildActivity({ id: "w2-a", date: "2026-06-08", points: 3 }),
      buildActivity({ id: "w2-b", date: "2026-06-09", points: 3 }),
    ];
    const summary = buildInsightsSummary({
      activities,
      artifacts: [],
      tracks: [buildTrack()],
      settings,
      today: "2026-06-15",
    });

    expect(summary.projection).toMatchObject({ basisWeeks: 2 });
    expect(summary.projection?.activeDays).toBeGreaterThan(0);
    expect(summary.projection?.points).toBeGreaterThan(0);
  });
});
