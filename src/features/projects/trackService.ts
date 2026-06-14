import { trackSchema } from "../../domain/schemas";
import type { Track } from "../../domain/types";
import type { TrackRepository } from "../../db/repositories";
import type { TrackFormValues } from "./trackFormSchema";

export async function updateTrack(input: {
  repository: TrackRepository;
  track: Track;
  values: TrackFormValues;
  now?: Date;
}): Promise<Track> {
  const { endOfYearGoal: existingGoal, ...trackWithoutGoal } = input.track;
  void existingGoal;
  const candidate = {
    ...trackWithoutGoal,
    ...input.values,
    ...(input.values.endOfYearGoal.trim()
      ? { endOfYearGoal: input.values.endOfYearGoal.trim() }
      : {}),
    updatedAt: (input.now ?? new Date()).toISOString(),
  };
  const track = trackSchema.parse(candidate) as Track;
  await input.repository.put(track);
  return track;
}

export async function setTrackStatus(input: {
  repository: TrackRepository;
  track: Track;
  status: Track["status"];
  now?: Date;
}): Promise<void> {
  await input.repository.put({
    ...input.track,
    status: input.status,
    updatedAt: (input.now ?? new Date()).toISOString(),
  });
}
