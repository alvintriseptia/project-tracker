import { z } from "zod";

const integer = z.preprocess((value) => Number(value), z.number().int().min(0));

export const trackFormSchema = z.object({
  name: z.string().trim().min(1, "Enter a project name."),
  description: z.string().trim(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Choose a valid color."),
  defaultPoints: integer,
  weeklyTarget: integer,
  minimumAction: z.string().trim().min(1, "Enter a minimum action."),
  normalAction: z.string().trim().min(1, "Enter a normal action."),
  strongAction: z.string().trim().min(1, "Enter a strong action."),
  endOfYearGoal: z.string(),
  countsTowardNoZero: z.boolean(),
});

export type TrackFormInput = z.input<typeof trackFormSchema>;
export type TrackFormValues = z.output<typeof trackFormSchema>;
