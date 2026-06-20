import type { InsightsSummary } from "./insights";
import type { Artifact, Track } from "./types";

export function buildYearEndReviewMarkdown(input: {
  insights: InsightsSummary;
  tracks: Track[];
  artifacts: Artifact[];
}): string {
  const trackSection = (slug: string) => {
    const track = input.tracks.find((item) => item.slug === slug || item.id === slug);
    const insight = input.insights.projectInsights.find((item) => item.track.id === track?.id);
    return [
      `Sessions: ${insight?.sessions ?? 0}`,
      `Points: ${insight?.points ?? 0}`,
      `End-of-year direction: ${track?.endOfYearGoal ?? "Not set."}`,
      "",
      "Reflection:",
      "",
    ].join("\n");
  };

  return [
    "# 2026 Semester Challenge Review",
    "",
    "## Time period",
    "June 2026 - December 2026",
    "",
    "## Total active days",
    String(input.insights.activeDays),
    "",
    "## Longest streak",
    String(input.insights.longestStreak),
    "",
    "## Total points",
    String(input.insights.totalPoints),
    "",
    "## Biggest transformation",
    "",
    "Write the clearest evidence-backed change here.",
    "",
    "## English progress",
    trackSection("english"),
    "## Korean progress",
    trackSection("korean"),
    "## Vinance progress",
    trackSection("vinance"),
    "## Devlog progress",
    `${artifactCount(input.artifacts, "devlog")} devlogs created.\n\nReflection:\n`,
    "## Taste-building progress",
    `${artifactCount(input.artifacts, "taste_note")} taste notes created.\n\nReflection:\n`,
    "## Conversation skill progress",
    `${artifactCount(input.artifacts, "conversation_reflection")} conversation reflections created.\n\nReflection:\n`,
    "## Marathon discipline lesson",
    `${artifactCount(input.artifacts, "marathon_reflection")} marathon reflections created.\n\nReflection:\n`,
    "## What I want to continue in 2027",
    "",
    "- ",
  ].join("\n");
}

function artifactCount(artifacts: Artifact[], type: Artifact["type"]): number {
  return artifacts.filter((artifact) => artifact.type === type && artifact.status !== "archived").length;
}
