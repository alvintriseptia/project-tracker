import { searchRecords } from "../search";
import type { MonthlyMission, VinanceFeature, VinanceTask } from "../types";
import { buildActivity, buildArtifact } from "../../test/builders";

const timestamp = "2026-06-14T00:00:00.000Z";

describe("searchRecords", () => {
  it("matches normalized text across activities and artifacts", () => {
    const results = searchRecords(
      {
        activities: [
          buildActivity({
            id: "activity-1",
            title: "Career answer practice",
            note: "Explained a React tradeoff",
            tags: ["English"],
          }),
        ],
        artifacts: [
          buildArtifact({
            id: "artifact-1",
            title: "Taste note",
            content: "Coffee shop observation",
            tags: ["Taste"],
          }),
        ],
        missions: [],
        vinanceFeatures: [],
        vinanceTasks: [],
        settings: { weekStartsOn: "monday" },
      },
      { query: "react tradeoff" },
    );

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: "activity-1",
      type: "activity",
      href: "/projects/english",
    });
  });

  it("filters by week, tags, project, action level, and points", () => {
    const results = searchRecords(
      {
        activities: [
          buildActivity({
            id: "match",
            date: "2026-06-10",
            level: "strong",
            points: 6,
            tags: ["deep-work"],
          }),
          buildActivity({
            id: "wrong-week",
            date: "2026-06-17",
            level: "strong",
            points: 6,
            tags: ["deep-work"],
          }),
          buildActivity({
            id: "wrong-points",
            date: "2026-06-11",
            level: "strong",
            points: 2,
            tags: ["deep-work"],
          }),
        ],
        artifacts: [],
        missions: [],
        vinanceFeatures: [],
        vinanceTasks: [],
        settings: { weekStartsOn: "monday" },
      },
      {
        week: "2026-06-12",
        trackId: "english",
        actionLevel: "strong",
        tags: ["deep-work"],
        minPoints: 5,
      },
    );

    expect(results.map((result) => result.id)).toEqual(["match"]);
  });

  it("includes missions and Vinance records in the corpus", () => {
    const mission: MonthlyMission = {
      id: "mission-1",
      month: "2026-07",
      title: "Vinance foundation",
      theme: "Finance app",
      checklist: [{ id: "item-1", label: "Roadmap", completed: false }],
      targetArtifactIds: [],
      notes: "",
      completed: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const feature: VinanceFeature = {
      id: "feature-1",
      name: "Portfolio summary",
      module: "dashboard",
      priority: "high",
      status: "planned",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const task: VinanceTask = {
      id: "task-1",
      featureId: "feature-1",
      title: "Wire dashboard cards",
      status: "blocked",
      sortOrder: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const results = searchRecords(
      {
        activities: [],
        artifacts: [],
        missions: [mission],
        vinanceFeatures: [feature],
        vinanceTasks: [task],
        settings: { weekStartsOn: "monday" },
      },
      { query: "dashboard" },
    );

    expect(results.map((result) => result.type)).toEqual([
      "vinance_feature",
      "vinance_task",
    ]);
  });
});
