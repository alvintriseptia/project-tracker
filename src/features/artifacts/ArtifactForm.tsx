import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "../../components/Button";
import {
  defaultDetails,
  getSpecializedWorkflow,
  isSpecializedArtifactType,
  type SpecializedArtifactDetails,
  type SpecializedArtifactType,
} from "../../domain/specializedArtifacts";
import type {
  Artifact,
  ArtifactDetails,
  LocalDate,
  Track,
} from "../../domain/types";
import {
  artifactFormSchema,
  artifactTypes,
  type ArtifactFormInput,
  type ArtifactFormValues,
} from "./artifactFormSchema";
import { SpecializedArtifactFields } from "./SpecializedArtifactFields";

const label = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());

function isArtifactType(value: unknown): value is Artifact["type"] {
  return typeof value === "string" && artifactTypes.some((type) => type === value);
}

function workflowDefaultTrackId(type: SpecializedArtifactType): string | undefined {
  const workflow = getSpecializedWorkflow(type);
  return "defaultTrackId" in workflow ? workflow.defaultTrackId : undefined;
}

function getInitialDetails(
  type: Artifact["type"],
  artifact?: Artifact,
): ArtifactDetails {
  if (isSpecializedArtifactType(type)) {
    return artifact?.details.kind === type
      ? artifact.details
      : defaultDetails(type);
  }
  return artifact?.details.kind === "generic"
    ? artifact.details
    : { kind: "generic" };
}

function hasUserSpecializedDetails(
  type: SpecializedArtifactType,
  details: ArtifactDetails,
): boolean {
  if (details.kind !== type) return false;

  const current = details as Record<string, unknown>;
  const fresh = defaultDetails(type) as Record<string, unknown>;
  const ignored = new Set(["kind", ...(type === "devlog" ? ["wordCount"] : [])]);

  for (const [key, defaultValue] of Object.entries(fresh)) {
    if (ignored.has(key)) continue;
    if (JSON.stringify(current[key]) !== JSON.stringify(defaultValue)) return true;
  }

  return Object.entries(current).some(([key, value]) => {
    if (ignored.has(key) || key in fresh) return false;
    if (value === undefined || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  });
}

function collectErrorMessages(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(collectErrorMessages);
  if (typeof value !== "object" || value === null) return [];

  const record = value as Record<string, unknown>;
  const messages = typeof record.message === "string" ? [record.message] : [];
  return [
    ...messages,
    ...Object.entries(record)
      .filter(([key]) => !["message", "type", "types", "ref"].includes(key))
      .flatMap(([, nestedValue]) => collectErrorMessages(nestedValue)),
  ];
}

export function ArtifactForm({
  artifact,
  tracks,
  today,
  initialType,
  initialTrackId,
  onSubmit,
}: {
  artifact?: Artifact;
  tracks: Track[];
  today: LocalDate;
  initialType?: Artifact["type"];
  initialTrackId?: string;
  onSubmit: (values: ArtifactFormValues) => Promise<void>;
}) {
  const selectedInitialType = artifact?.type
    ?? (isArtifactType(initialType) ? initialType : "custom");
  const initialWorkflow = isSpecializedArtifactType(selectedInitialType)
    ? getSpecializedWorkflow(selectedInitialType)
    : undefined;
  const initialWorkflowTrackId = isSpecializedArtifactType(selectedInitialType)
    ? workflowDefaultTrackId(selectedInitialType)
    : undefined;
  const initialDetails = getInitialDetails(selectedInitialType, artifact);
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ArtifactFormInput, unknown, ArtifactFormValues>({
    resolver: zodResolver(artifactFormSchema),
    mode: "onBlur",
    defaultValues: {
      title: artifact?.title ?? "",
      type: selectedInitialType,
      date: artifact?.date ?? today,
      trackId: artifact
        ? artifact.trackId ?? ""
        : initialTrackId ?? initialWorkflowTrackId ?? "",
      tags: artifact?.tags.join(", ") ?? "",
      status: artifact?.status ?? "drafting",
      content: artifact?.content ?? "",
      externalLink: artifact?.externalLink ?? "",
      createActivity: artifact ? false : initialWorkflow?.createActivityByDefault ?? false,
      details: initialDetails,
    } as ArtifactFormInput,
  });
  const selectedType = useWatch({ control, name: "type" });
  const errorMessages = [...new Set(collectErrorMessages(errors))];
  const typeRegistration = register("type");

  function changeType(nextType: Artifact["type"]) {
    const currentType = getValues("type");
    if (nextType === currentType) return;

    const currentDetails = getValues("details");
    if (
      isSpecializedArtifactType(currentType) &&
      hasUserSpecializedDetails(currentType, currentDetails) &&
      !window.confirm("Change artifact type and reset specialized details?")
    ) {
      setValue("type", currentType);
      return;
    }

    setValue("type", nextType, { shouldDirty: true });
    if (isSpecializedArtifactType(nextType)) {
      setValue("details", defaultDetails(nextType) as SpecializedArtifactDetails, {
        shouldDirty: true,
      });
      setValue(
        "createActivity",
        artifact ? false : getSpecializedWorkflow(nextType).createActivityByDefault,
        { shouldDirty: true },
      );
      const defaultTrackId = workflowDefaultTrackId(nextType);
      if (!artifact && defaultTrackId) {
        setValue("trackId", defaultTrackId, { shouldDirty: true });
      }
      return;
    }

    setValue("details", { kind: "generic" }, { shouldDirty: true });
    setValue("createActivity", false, { shouldDirty: true });
  }

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
          <select
            id="artifact-type"
            className="field-control"
            {...typeRegistration}
            value={selectedType}
            onChange={(event) => {
              if (isArtifactType(event.target.value)) changeType(event.target.value);
            }}
          >
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
      {isSpecializedArtifactType(selectedType) ? (
        <SpecializedArtifactFields
          activeType={selectedType}
          register={register}
          setValue={setValue}
          errors={errors}
          control={control}
        />
      ) : null}
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
