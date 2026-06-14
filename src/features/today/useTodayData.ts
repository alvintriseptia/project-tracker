import { useLiveQuery } from "dexie-react-hooks";

import { todayInTimeZone } from "../../domain/dates";
import {
  activitiesInRange,
  getStreaks,
  totalPoints,
  weekRange,
  weeklyStatus,
  weeklyTrackProgress,
} from "../../domain/selectors";
import { db } from "../../db/database";
import {
  ActivityRepository,
  SettingsRepository,
  TrackRepository,
} from "../../db/repositories";

const activityRepository = new ActivityRepository(db);
const settingsRepository = new SettingsRepository(db);
const trackRepository = new TrackRepository(db);

export function useTodayData() {
  return useLiveQuery(async () => {
    const [settings, tracks] = await Promise.all([
      settingsRepository.get(),
      trackRepository.list(),
    ]);
    const today = todayInTimeZone(settings.timeZone);
    const activities = await activityRepository.listByDateRange({
      from: settings.challengeStartDate,
      to: settings.challengeEndDate,
    });
    const currentWeek = weekRange(today, settings);
    const weekActivities = activitiesInRange(activities, currentWeek);
    return {
      settings,
      tracks,
      activeTracks: tracks.filter((track) => track.status === "active"),
      activities,
      today,
      todayActivities: activities
        .filter((activity) => activity.date === today)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
      streaks: getStreaks(activities, tracks, settings, today),
      currentWeek,
      weeklyPoints: totalPoints(weekActivities),
      weeklyStatus: weeklyStatus(
        totalPoints(weekActivities),
        settings.weeklyThresholds,
      ),
      progress: weeklyTrackProgress(activities, tracks, currentWeek),
    };
  }, []);
}
