import { z } from "zod";

import { isLocalDate } from "../../domain/dates";

const optionalPositiveInteger = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : Number(value)),
  z.number().int().positive().optional(),
);

const nonNegativeInteger = z.preprocess(
  (value) => Number(value),
  z.number().int().min(0),
);

export const activityFormSchema = z.object({
  trackId: z.string().min(1, "Choose a project."),
  level: z.enum(["minimum", "normal", "strong"]),
  title: z.string().trim().min(1, "Describe what you completed."),
  date: z.string().refine(isLocalDate, "Choose a valid date."),
  durationMinutes: optionalPositiveInteger,
  note: z.string(),
  points: nonNegativeInteger,
  bonusPoints: nonNegativeInteger,
  tags: z.string(),
});

export type ActivityFormValues = z.infer<typeof activityFormSchema>;
export type ActivityFormInput = z.input<typeof activityFormSchema>;
