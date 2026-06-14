import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "../../components/Button";
import type { Artifact, LocalDate, Track } from "../../domain/types";
import {
  artifactFormSchema,
  artifactTypes,
  type ArtifactFormInput,
  type ArtifactFormValues,
} from "./artifactFormSchema";

const label = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());

export function ArtifactForm({
  artifact,
  tracks,
  today,
  initialType,
  onSubmit,
}: {
  artifact?: Artifact;
  tracks: Track[];
  today: LocalDate;
  initialType?: Artifact["type"];
  onSubmit: (values: ArtifactFormValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ArtifactFormInput, unknown, ArtifactFormValues>({
    resolver: zodResolver(artifactFormSchema),
    mode: "onBlur",
    defaultValues: {
      title: artifact?.title ?? "",
      type: artifact?.type ?? initialType ?? "custom",
      date: artifact?.date ?? today,
      trackId: artifact?.trackId ?? "",
      tags: artifact?.tags.join(", ") ?? "",
      status: artifact?.status ?? "drafting",
      content: artifact?.content ?? "",
      externalLink: artifact?.externalLink ?? "",
      createActivity: false,
    },
  });
  const errorMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter((message): message is string => Boolean(message));
  return (
    <form className="grid gap-5" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      {errorMessages.length > 0 ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-danger">
          {errorMessages.join(" ")}
        </div>
      ) : null}
      <div>
        <label className="field-label" htmlFor="artifact-title">Title</label>
        <input id="artifact-title" className="field-control" autoFocus {...register("title")} />
        {errors.title ? <p className="mt-1 text-sm text-danger">{errors.title.message}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="artifact-type">Type</label>
          <select id="artifact-type" className="field-control" {...register("type")}>
            {artifactTypes.map((type) => <option key={type} value={type}>{label(type)}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="artifact-date">Date</label>
          <input id="artifact-date" type="date" className="field-control" {...register("date")} />
        </div>
        <div>
          <label className="field-label" htmlFor="artifact-project">Project</label>
          <select id="artifact-project" className="field-control" {...register("trackId")}>
            <option value="">No linked project</option>
            {tracks.map((track) => <option key={track.id} value={track.id}>{track.name}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="artifact-status">Status</label>
          <select id="artifact-status" className="field-control" {...register("status")}>
            {["idea", "drafting", "reviewed", "published", "completed", "archived"].map(
              (status) => <option key={status} value={status}>{label(status)}</option>,
            )}
          </select>
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="artifact-content">Content</label>
        <textarea id="artifact-content" rows={12} className="field-control resize-y" {...register("content")} />
      </div>
      <div>
        <label className="field-label" htmlFor="artifact-tags">Tags</label>
        <input id="artifact-tags" className="field-control" placeholder="reflection, product" {...register("tags")} />
      </div>
      <div>
        <label className="field-label" htmlFor="artifact-link">External link</label>
        <input id="artifact-link" type="url" className="field-control" placeholder="https://…" {...register("externalLink")} />
        {errors.externalLink ? <p className="mt-1 text-sm text-danger">{errors.externalLink.message}</p> : null}
      </div>
      {!artifact ? (
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" className="size-5 accent-brand" {...register("createActivity")} />
          <span>
            <span className="block font-semibold">Also count as an activity</span>
            <span className="block text-sm text-muted">Requires a linked project and creates one normal action.</span>
          </span>
        </label>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : artifact ? "Save artifact" : "Create artifact"}
      </Button>
    </form>
  );
}
