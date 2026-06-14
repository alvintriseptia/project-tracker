import { activitySchema } from "../../domain/schemas";
import { tagsFromInput } from "../../domain/tags";
import type { Activity, Track } from "../../domain/types";
import type { ActivityRepository } from "../../db/repositories";
import type { ActivityFormValues } from "./activityFormSchema";

function activityFromValues(
  values: ActivityFormValues,
  track: Track,
  timestamp: string,
  existing?: Activity,
): Activity {
  if (values.trackId !== track.id) {
    throw new Error("The selected project is unavailable.");
  }
  const candidate = {
    id: existing?.id ?? crypto.randomUUID(),
    date: values.date,
    trackId: values.trackId,
    level: values.level,
    title: values.title.trim(),
    ...(values.note.trim() ? { note: values.note.trim() } : {}),
    ...(values.durationMinutes
      ? { durationMinutes: values.durationMinutes }
      : {}),
    points: values.points,
    bonusPoints: values.bonusPoints,
    tags: tagsFromInput(values.tags),
    artifactIds: existing?.artifactIds ?? [],
    ...(existing?.metadata ? { metadata: existing.metadata } : {}),
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  return activitySchema.parse(candidate) as Activity;
}

export async function saveActivity(input: {
  repository: ActivityRepository;
  values: ActivityFormValues;
  track: Track;
  existing?: Activity;
  now?: Date;
}): Promise<Activity> {
  const activity = activityFromValues(
    input.values,
    input.track,
    (input.now ?? new Date()).toISOString(),
    input.existing,
  );
  await input.repository.put(activity);
  return activity;
}

export function deleteActivity(
  repository: ActivityRepository,
  id: string,
): Promise<void> {
  return repository.delete(id);
}
