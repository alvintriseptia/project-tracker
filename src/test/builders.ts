import type { Activity, Track } from "../domain/types";

const timestamp = "2026-06-14T00:00:00.000Z";

export function buildTrack(overrides: Partial<Track> = {}): Track {
  return {
    id: "english",
    slug: "english",
    name: "English",
    description: "Career communication practice",
    icon: "Languages",
    color: "#2563eb",
    status: "active",
    sortOrder: 10,
    defaultPoints: 2,
    weeklyTarget: 5,
    minimumAction: "Speak",
    normalAction: "Practice",
    strongAction: "Explain",
    countsTowardNoZero: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

export function buildActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: "activity-1",
    date: "2026-06-14",
    trackId: "english",
    level: "minimum",
    title: "Speak for three minutes",
    points: 2,
    bonusPoints: 0,
    tags: [],
    artifactIds: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}
