import type { MissionChecklistItem, MonthlyMission } from "./types";

export function missionProgress(mission: MonthlyMission): number {
  if (mission.checklist.length === 0) {
    return mission.completed ? 100 : 0;
  }
  const completed = mission.checklist.filter((item) => item.completed).length;
  return Math.round((completed / mission.checklist.length) * 100);
}

export function setChecklistItemCompletion(
  item: MissionChecklistItem,
  completed: boolean,
  timestamp: string,
): MissionChecklistItem {
  return completed
    ? { ...item, completed: true, completedAt: timestamp }
    : { id: item.id, label: item.label, completed: false };
}
