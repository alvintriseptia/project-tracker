import { missionProgress, setChecklistItemCompletion } from "../missions";
import type { MonthlyMission } from "../types";

const mission: MonthlyMission = {
  id: "2026-06",
  month: "2026-06",
  title: "Build",
  theme: "Build",
  checklist: [
    { id: "one", label: "One", completed: true, completedAt: "2026-06-01T00:00:00.000Z" },
    { id: "two", label: "Two", completed: false },
  ],
  targetArtifactIds: [],
  notes: "",
  completed: false,
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
};

describe("mission helpers", () => {
  it("derives progress and handles empty completed missions", () => {
    expect(missionProgress(mission)).toBe(50);
    expect(missionProgress({ ...mission, checklist: [] })).toBe(0);
    expect(missionProgress({ ...mission, checklist: [], completed: true })).toBe(100);
  });

  it("sets and clears completion timestamps", () => {
    const item = { id: "one", label: "One", completed: false };
    expect(
      setChecklistItemCompletion(item, true, "2026-06-14T00:00:00.000Z"),
    ).toMatchObject({ completed: true, completedAt: "2026-06-14T00:00:00.000Z" });
    expect(
      setChecklistItemCompletion(
        { ...item, completed: true, completedAt: "2026-06-14T00:00:00.000Z" },
        false,
        "2026-06-15T00:00:00.000Z",
      ),
    ).toEqual({ id: "one", label: "One", completed: false });
  });
});
