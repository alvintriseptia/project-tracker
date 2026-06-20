import { buildInsightsSummary } from "../insights";
import { buildYearEndReviewMarkdown } from "../yearEndReview";
import type { AppSettings } from "../types";
import { buildActivity, buildArtifact, buildTrack } from "../../test/builders";

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
  updatedAt: "2026-06-14T00:00:00.000Z",
};

describe("buildYearEndReviewMarkdown", () => {
  it("generates the PRD review sections from local insights", () => {
    const tracks = [
      buildTrack({ id: "english", slug: "english", endOfYearGoal: "Speak clearly at work." }),
      buildTrack({ id: "vinance", slug: "vinance", name: "Vinance", endOfYearGoal: "Ship dashboard progress." }),
    ];
    const artifacts = [
      buildArtifact({ id: "devlog-1", type: "devlog", status: "published" }),
      buildArtifact({ id: "conversation-1", type: "conversation_reflection", status: "completed" }),
    ];
    const insights = buildInsightsSummary({
      activities: [
        buildActivity({ id: "a1", date: "2026-06-01", trackId: "english", points: 2 }),
        buildActivity({ id: "a2", date: "2026-06-02", trackId: "vinance", points: 5 }),
      ],
      artifacts,
      tracks,
      settings,
      today: "2026-06-03",
    });

    const markdown = buildYearEndReviewMarkdown({ insights, tracks, artifacts });

    expect(markdown).toContain("# 2026 Semester Challenge Review");
    expect(markdown).toContain("## English progress");
    expect(markdown).toContain("End-of-year direction: Speak clearly at work.");
    expect(markdown).toContain("## Vinance progress");
    expect(markdown).toContain("1 devlogs created.");
    expect(markdown).toContain("1 conversation reflections created.");
    expect(markdown).toContain("## What I want to continue in 2027");
  });
});
