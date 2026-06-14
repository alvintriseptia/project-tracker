import { appSettingsSchema, activitySchema } from "../schemas";

describe("domain schemas", () => {
  it("normalizes activity tags", () => {
    const parsed = activitySchema.parse({
      id: "activity",
      date: "2026-06-14",
      trackId: "english",
      level: "minimum",
      title: "Practice",
      points: 2,
      bonusPoints: 0,
      tags: [" English ", "english"],
      artifactIds: [],
      createdAt: "2026-06-14T00:00:00.000Z",
      updatedAt: "2026-06-14T00:00:00.000Z",
    });
    expect(parsed.tags).toEqual(["English"]);
  });

  it("rejects invalid challenge thresholds", () => {
    const result = appSettingsSchema.safeParse({
      id: "app",
      challengeStartDate: "2026-06-14",
      challengeEndDate: "2026-12-31",
      weekStartsOn: "monday",
      locale: "en-US",
      timeZone: "Asia/Jakarta",
      theme: "system",
      weeklyThresholds: { minimumWin: 15, goodWeek: 15, excellentWeek: 28 },
      reminders: { enabled: false },
      updatedAt: "2026-06-14T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });
});
