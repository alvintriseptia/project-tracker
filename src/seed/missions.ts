import type { Instant, MonthlyMission } from "../domain/types";

const MISSION_SEEDS = [
  {
    month: "2026-06",
    title: "Build the System",
    theme: "Build the system",
    checklist: [
      "App initialized",
      "Project tracks defined",
      "Weekly targets defined",
      "Vinance roadmap added",
      "First taste note added",
      "First conversation reflection added",
    ],
  },
  {
    month: "2026-07",
    title: "Start the Engine",
    theme: "Start the engine",
    checklist: [
      "First consistent month",
      "4 devlogs",
      "Vinance finance domain model",
      "15+ English reps",
      "10+ Korean reps",
    ],
  },
  {
    month: "2026-08",
    title: "Build Momentum",
    theme: "Build momentum",
    checklist: [
      "Transaction CRUD progress in Vinance",
      "4 devlogs",
      "8+ taste notes total",
      "8+ conversation reflections total",
    ],
  },
  {
    month: "2026-09",
    title: "Raise the Standard",
    theme: "Raise the standard",
    checklist: [
      "Monthly summary or dashboard progress in Vinance",
      "Stronger English technical explanation notes",
      "Korean consistency maintained",
      "Better devlog quality",
    ],
  },
  {
    month: "2026-10",
    title: "Marathon Discipline Month",
    theme: "Marathon discipline month",
    checklist: [
      "Maintain no-zero-day during marathon month",
      "Marathon reflection artifact",
      "At least one marathon-themed devlog or essay",
      "Minimum activity maintained during fatigue",
    ],
  },
  {
    month: "2026-11",
    title: "Product Maturity",
    theme: "Product maturity",
    checklist: [
      "Vinance usability improved",
      "Portfolio positioning notes",
      "Documentation improved",
      "Taste analysis quality improved",
    ],
  },
  {
    month: "2026-12",
    title: "Year Packaging",
    theme: "Year packaging",
    checklist: [
      "Year review",
      "Semester reflection",
      "Best devlogs collection",
      "Vinance portfolio summary",
      "Personal transformation review",
    ],
  },
] as const;

export function createSeedMissions(timestamp: Instant): MonthlyMission[] {
  return MISSION_SEEDS.map((mission) => ({
    id: mission.month,
    month: mission.month,
    title: mission.title,
    theme: mission.theme,
    description: "",
    checklist: mission.checklist.map((label, index) => ({
      id: `${mission.month}-item-${index + 1}`,
      label,
      completed: false,
    })),
    targetArtifactIds: [],
    notes: "",
    completed: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));
}
