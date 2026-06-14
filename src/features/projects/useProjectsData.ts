import { useLiveQuery } from "dexie-react-hooks";

import { todayInTimeZone } from "../../domain/dates";
import {
  trackTotals,
  weekRange,
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

export function useProjectsData() {
  return useLiveQuery(async () => {
    const [tracks, settings] = await Promise.all([
      trackRepository.list(),
      settingsRepository.get(),
    ]);
    const activities = await activityRepository.listByDateRange({
      from: settings.challengeStartDate,
      to: settings.challengeEndDate,
    });
    const today = todayInTimeZone(settings.timeZone);
    const progress = weeklyTrackProgress(activities, tracks, weekRange(today, settings));
    const progressByTrack = new Map(progress.map((item) => [item.track.id, item]));
    return {
      tracks: tracks.map((track) => ({
        track,
        totals: trackTotals(activities, track.id),
        progress: progressByTrack.get(track.id),
      })),
    };
  }, []);
}

export function useProjectData(trackId: string) {
  return useLiveQuery(async () => {
    const [track, settings] = await Promise.all([
      trackRepository.get(trackId),
      settingsRepository.get(),
    ]);
    if (!track) return { missing: true as const };
    const activities = (await activityRepository.listByTrack(trackId)).sort(
      (left, right) =>
        right.date.localeCompare(left.date) ||
        right.createdAt.localeCompare(left.createdAt),
    );
    const progress = weeklyTrackProgress(
      activities,
      [track],
      weekRange(todayInTimeZone(settings.timeZone), settings),
    )[0];
    return {
      missing: false as const,
      track,
      activities,
      totals: trackTotals(activities, track.id),
      progress,
    };
  }, [trackId]);
}
