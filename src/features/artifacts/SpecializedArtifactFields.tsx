import { useEffect, useState } from "react";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  useWatch,
} from "react-hook-form";

import { Button } from "../../components/Button";
import {
  conversationActivityTypes,
  conversationQuestions,
  devlogTemplate,
  devlogTypes,
  englishPracticeTypes,
  englishTemplateOptions,
  englishTemplates,
  koreanActivityTypes,
  koreanEnjoymentOptions,
  marathonReflectionTypes,
  normalizeLineList,
  oneToFiveRatings,
  tasteCategories,
  wordCount,
  type SpecializedArtifactType,
} from "../../domain/specializedArtifacts";
import type {
  ArtifactFormInput,
  ArtifactFormValues,
} from "./artifactFormSchema";

type SpecializedArtifactFieldsProps = {
  activeType: SpecializedArtifactType;
  register: UseFormRegister<ArtifactFormInput>;
  setValue: UseFormSetValue<ArtifactFormInput>;
  errors: FieldErrors<ArtifactFormInput>;
  control: Control<ArtifactFormInput, unknown, ArtifactFormValues>;
};

const label = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());

const tasteTextFields = [
  ["firstImpression", "First impression"],
  ["good", "What is good?"],
  ["bad", "What is not good?"],
  ["reasoning", "Why does it work or not work?"],
  ["reusableInsight", "What can I reuse?"],
] as const;

const conversationTextFields = [
  ["questionAsked", "Question asked"],
  ["bestInsight", "Best insight heard"],
  ["selfObservation", "What I noticed about myself"],
  ["improvement", "What I should improve"],
  ["followUpAction", "Follow-up action"],
] as const;

const marathonTextFields = [
  ["mentalCondition", "Mental condition"],
  ["worked", "What worked"],
  ["failed", "What failed"],
  ["lesson", "Marathon lesson"],
] as const;

function messageFrom(value: unknown): string | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const message = (value as Record<string, unknown>).message;
  return typeof message === "string" ? message : undefined;
}

function detailError(
  errors: FieldErrors<ArtifactFormInput>,
  field: string,
): string | undefined {
  if (typeof errors.details !== "object" || errors.details === null) return undefined;
  return messageFrom((errors.details as Record<string, unknown>)[field]);
}

function FieldError({ message }: { message: string | undefined }) {
  return message ? <p className="mt-1 text-sm text-danger">{message}</p> : null;
}

function LineListTextarea({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [text, setText] = useState(() => value.join("\n"));

  return (
    <textarea
      id={id}
      rows={4}
      className="field-control resize-y"
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        onChange(normalizeLineList(event.target.value));
      }}
    />
  );
}

function EnglishFields({
  register,
  setValue,
  errors,
  control,
}: Omit<SpecializedArtifactFieldsProps, "activeType">) {
  const watchedContent = useWatch({ control, name: "content" });
  const selectedTemplate = useWatch({ control, name: "details.template" });
  const content = typeof watchedContent === "string" ? watchedContent : "";

  function applyTemplate(template: keyof typeof englishTemplates) {
    if (
      content !== "" &&
      !window.confirm("Replace the current content with this template?")
    ) {
      return;
    }
    setValue("details.template", template, { shouldDirty: true });
    setValue("content", englishTemplates[template], { shouldDirty: true });
  }

  return (
    <fieldset className="grid gap-4 rounded-xl border border-line p-4">
      <legend className="px-1 font-display text-xl font-semibold">English practice details</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="artifact-english-practice-type">Practice type</label>
          <select id="artifact-english-practice-type" className="field-control" {...register("details.practiceType")}>
            {englishPracticeTypes.map((option) => <option key={option} value={option}>{label(option)}</option>)}
          </select>
          <FieldError message={detailError(errors, "practiceType")} />
        </div>
        <div>
          <label className="field-label" htmlFor="artifact-english-topic">Topic</label>
          <input id="artifact-english-topic" className="field-control" {...register("details.topic")} />
          <FieldError message={detailError(errors, "topic")} />
        </div>
        <div>
          <label className="field-label" htmlFor="artifact-english-duration">Duration (minutes)</label>
          <input
            id="artifact-english-duration"
            type="number"
            min={0}
            className="field-control"
            {...register("details.durationMinutes", { valueAsNumber: true })}
          />
          <FieldError message={detailError(errors, "durationMinutes")} />
        </div>
        <div>
          <label className="field-label" htmlFor="artifact-english-confidence">Confidence</label>
          <select
            id="artifact-english-confidence"
            className="field-control"
            {...register("details.confidence", { valueAsNumber: true })}
          >
            {oneToFiveRatings.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <FieldError message={detailError(errors, "confidence")} />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="artifact-english-notes">Notes</label>
        <textarea id="artifact-english-notes" rows={4} className="field-control resize-y" {...register("details.notes")} />
        <FieldError message={detailError(errors, "notes")} />
      </div>
      <div>
        <label className="field-label" htmlFor="artifact-english-mistakes">Mistakes noticed</label>
        <textarea id="artifact-english-mistakes" rows={4} className="field-control resize-y" {...register("details.mistakesNoticed")} />
        <FieldError message={detailError(errors, "mistakesNoticed")} />
      </div>
      <div>
        <label className="field-label" htmlFor="artifact-english-improved">Improved version</label>
        <textarea id="artifact-english-improved" rows={4} className="field-control resize-y" {...register("details.improvedVersion")} />
        <FieldError message={detailError(errors, "improvedVersion")} />
      </div>
      <div>
        <label className="field-label" htmlFor="artifact-english-template">Template selector</label>
        <select id="artifact-english-template" className="field-control" {...register("details.template")}>
          {englishTemplateOptions.map((option) => <option key={option} value={option}>{label(option)}</option>)}
        </select>
        <FieldError message={detailError(errors, "template")} />
        <div className="mt-3 flex flex-wrap gap-2">
          {englishTemplateOptions.filter((option) => option !== "none").map((option) => (
            <Button
              key={option}
              size="sm"
              variant={selectedTemplate === option ? "primary" : "secondary"}
              onClick={() => applyTemplate(option)}
            >
              Apply {label(option)}
            </Button>
          ))}
        </div>
      </div>
    </fieldset>
  );
}

function KoreanFields({
  register,
  errors,
  control,
}: Omit<SpecializedArtifactFieldsProps, "activeType" | "setValue">) {
  return (
    <fieldset className="grid gap-4 rounded-xl border border-line p-4">
      <legend className="px-1 font-display text-xl font-semibold">Korean learning details</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="artifact-korean-activity-type">Activity type</label>
          <select id="artifact-korean-activity-type" className="field-control" {...register("details.activityType")}>
            {koreanActivityTypes.map((option) => <option key={option} value={option}>{label(option)}</option>)}
          </select>
          <FieldError message={detailError(errors, "activityType")} />
        </div>
        <div>
          <label className="field-label" htmlFor="artifact-korean-duration">Duration (minutes)</label>
          <input
            id="artifact-korean-duration"
            type="number"
            min={0}
            className="field-control"
            {...register("details.durationMinutes", { valueAsNumber: true })}
          />
          <FieldError message={detailError(errors, "durationMinutes")} />
        </div>
        <div>
          <label className="field-label" htmlFor="artifact-korean-source">Source</label>
          <input id="artifact-korean-source" className="field-control" {...register("details.source")} />
          <FieldError message={detailError(errors, "source")} />
        </div>
        <div>
          <label className="field-label" htmlFor="artifact-korean-enjoyment">Enjoyment</label>
          <select id="artifact-korean-enjoyment" className="field-control" {...register("details.enjoyment")}>
            {koreanEnjoymentOptions.map((option) => <option key={option} value={option}>{label(option)}</option>)}
          </select>
          <FieldError message={detailError(errors, "enjoyment")} />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="artifact-korean-words">Words learned</label>
        <Controller
          name="details.wordsLearned"
          control={control}
          render={({ field }) => (
            <LineListTextarea
              id="artifact-korean-words"
              value={Array.isArray(field.value)
                ? field.value.filter((value): value is string => typeof value === "string")
                : []}
              onChange={field.onChange}
            />
          )}
        />
        <FieldError message={detailError(errors, "wordsLearned")} />
      </div>
      <div>
        <label className="field-label" htmlFor="artifact-korean-phrases">Phrases learned</label>
        <Controller
          name="details.phrasesLearned"
          control={control}
          render={({ field }) => (
            <LineListTextarea
              id="artifact-korean-phrases"
              value={Array.isArray(field.value)
                ? field.value.filter((value): value is string => typeof value === "string")
                : []}
              onChange={field.onChange}
            />
          )}
        />
        <FieldError message={detailError(errors, "phrasesLearned")} />
      </div>
      <div>
        <label className="field-label" htmlFor="artifact-korean-notes">Notes</label>
        <textarea id="artifact-korean-notes" rows={4} className="field-control resize-y" {...register("details.notes")} />
        <FieldError message={detailError(errors, "notes")} />
      </div>
    </fieldset>
  );
}

function DevlogFields({
  register,
  setValue,
  errors,
  control,
}: Omit<SpecializedArtifactFieldsProps, "activeType">) {
  const watchedContent = useWatch({ control, name: "content" });
  const content = typeof watchedContent === "string" ? watchedContent : "";
  const count = wordCount(content);

  useEffect(() => {
    setValue("details.wordCount", count);
  }, [count, setValue]);

  function applyTemplate() {
    if (
      content !== "" &&
      !window.confirm("Replace the current content with this template?")
    ) {
      return;
    }
    setValue("content", devlogTemplate, { shouldDirty: true });
  }

  return (
    <fieldset className="grid gap-4 rounded-xl border border-line p-4">
      <legend className="px-1 font-display text-xl font-semibold">Devlog details</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="artifact-devlog-type">Devlog type</label>
          <select id="artifact-devlog-type" className="field-control" {...register("details.devlogType")}>
            {devlogTypes.map((option) => <option key={option} value={option}>{label(option)}</option>)}
          </select>
          <FieldError message={detailError(errors, "devlogType")} />
        </div>
        <div>
          <label className="field-label" htmlFor="artifact-devlog-word-count">Word count</label>
          <input id="artifact-devlog-word-count" className="field-control" value={count} readOnly />
          <FieldError message={detailError(errors, "wordCount")} />
        </div>
      </div>
      <div>
        <Button variant="secondary" onClick={applyTemplate}>Apply devlog template</Button>
      </div>
    </fieldset>
  );
}

function TasteFields({
  register,
  errors,
  control,
}: Omit<SpecializedArtifactFieldsProps, "activeType" | "setValue">) {
  const category = useWatch({ control, name: "details.category" });

  return (
    <fieldset className="grid gap-4 rounded-xl border border-line p-4">
      <legend className="px-1 font-display text-xl font-semibold">Taste note details</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="artifact-taste-category">Category</label>
          <select id="artifact-taste-category" className="field-control" {...register("details.category")}>
            {tasteCategories.map((option) => <option key={option} value={option}>{label(option)}</option>)}
          </select>
          <FieldError message={detailError(errors, "category")} />
        </div>
        {category === "custom" ? (
          <div>
            <label className="field-label" htmlFor="artifact-taste-custom-category">Custom category</label>
            <input id="artifact-taste-custom-category" className="field-control" {...register("details.customCategory")} />
            <FieldError message={detailError(errors, "customCategory")} />
          </div>
        ) : null}
        <div>
          <label className="field-label" htmlFor="artifact-taste-location">Location</label>
          <input id="artifact-taste-location" className="field-control" {...register("details.location")} />
          <FieldError message={detailError(errors, "location")} />
        </div>
        <div>
          <label className="field-label" htmlFor="artifact-taste-rating">Rating</label>
          <select
            id="artifact-taste-rating"
            className="field-control"
            {...register("details.rating", {
              setValueAs: (value: unknown) => value === "" ? undefined : Number(value),
            })}
          >
            <option value="">No rating</option>
            {oneToFiveRatings.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <FieldError message={detailError(errors, "rating")} />
        </div>
      </div>
      {tasteTextFields.map(([field, fieldLabel]) => (
        <div key={field}>
          <label className="field-label" htmlFor={`artifact-taste-${field}`}>{fieldLabel}</label>
          <textarea
            id={`artifact-taste-${field}`}
            rows={4}
            className="field-control resize-y"
            {...register(`details.${field}`)}
          />
          <FieldError message={detailError(errors, field)} />
        </div>
      ))}
      <div>
        <label className="field-label" htmlFor="artifact-taste-photo">Photo reference</label>
        <input id="artifact-taste-photo" className="field-control" {...register("details.photoReference")} />
        <FieldError message={detailError(errors, "photoReference")} />
      </div>
    </fieldset>
  );
}

function ConversationFields({
  register,
  setValue,
  errors,
}: Omit<SpecializedArtifactFieldsProps, "activeType" | "control">) {
  return (
    <fieldset className="grid gap-4 rounded-xl border border-line p-4">
      <legend className="px-1 font-display text-xl font-semibold">Conversation reflection details</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="artifact-conversation-activity-type">Activity type</label>
          <select id="artifact-conversation-activity-type" className="field-control" {...register("details.activityType")}>
            {conversationActivityTypes.map((option) => <option key={option} value={option}>{label(option)}</option>)}
          </select>
          <FieldError message={detailError(errors, "activityType")} />
        </div>
        <div>
          <label className="field-label" htmlFor="artifact-conversation-person">Person or group</label>
          <input id="artifact-conversation-person" className="field-control" {...register("details.personOrGroup")} />
          <FieldError message={detailError(errors, "personOrGroup")} />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="artifact-conversation-context">Conversation context</label>
        <textarea id="artifact-conversation-context" rows={3} className="field-control resize-y" {...register("details.context")} />
        <FieldError message={detailError(errors, "context")} />
      </div>
      <div>
        <label className="field-label" htmlFor="artifact-conversation-question-bank">Question bank selector</label>
        <select
          id="artifact-conversation-question-bank"
          className="field-control"
          defaultValue=""
          onChange={(event) => {
            if (event.target.value) {
              setValue("details.questionAsked", event.target.value, { shouldDirty: true });
            }
          }}
        >
          <option value="">Choose a question</option>
          {conversationQuestions.map((question) => <option key={question} value={question}>{question}</option>)}
        </select>
      </div>
      {conversationTextFields.map(([field, fieldLabel]) => (
        <div key={field}>
          <label className="field-label" htmlFor={`artifact-conversation-${field}`}>{fieldLabel}</label>
          <textarea
            id={`artifact-conversation-${field}`}
            rows={3}
            className="field-control resize-y"
            {...register(`details.${field}`)}
          />
          <FieldError message={detailError(errors, field)} />
        </div>
      ))}
      <label className="flex min-h-11 items-center gap-3">
        <input type="checkbox" className="size-5 accent-brand" {...register("details.followUpCompleted")} />
        <span className="font-semibold">Follow-up completed</span>
      </label>
      <FieldError message={detailError(errors, "followUpCompleted")} />
    </fieldset>
  );
}

function MarathonFields({
  register,
  errors,
}: Omit<SpecializedArtifactFieldsProps, "activeType" | "setValue" | "control">) {
  return (
    <fieldset className="grid gap-4 rounded-xl border border-line p-4">
      <legend className="px-1 font-display text-xl font-semibold">Marathon reflection details</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="artifact-marathon-type">Reflection type</label>
          <select id="artifact-marathon-type" className="field-control" {...register("details.reflectionType")}>
            {marathonReflectionTypes.map((option) => <option key={option} value={option}>{label(option)}</option>)}
          </select>
          <FieldError message={detailError(errors, "reflectionType")} />
        </div>
        <div>
          <label className="field-label" htmlFor="artifact-marathon-distance">Distance (km)</label>
          <input
            id="artifact-marathon-distance"
            type="number"
            min={0}
            step="any"
            className="field-control"
            {...register("details.distanceKm", {
              setValueAs: (value: unknown) => value === "" ? undefined : Number(value),
            })}
          />
          <FieldError message={detailError(errors, "distanceKm")} />
        </div>
        <div>
          <label className="field-label" htmlFor="artifact-marathon-pace">Pace</label>
          <input id="artifact-marathon-pace" className="field-control" {...register("details.pace")} />
          <FieldError message={detailError(errors, "pace")} />
        </div>
        <div>
          <label className="field-label" htmlFor="artifact-marathon-energy">Energy</label>
          <select
            id="artifact-marathon-energy"
            className="field-control"
            {...register("details.energy", { valueAsNumber: true })}
          >
            {oneToFiveRatings.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <FieldError message={detailError(errors, "energy")} />
        </div>
      </div>
      {marathonTextFields.map(([field, fieldLabel]) => (
        <div key={field}>
          <label className="field-label" htmlFor={`artifact-marathon-${field}`}>{fieldLabel}</label>
          <textarea
            id={`artifact-marathon-${field}`}
            rows={4}
            className="field-control resize-y"
            {...register(`details.${field}`)}
          />
          <FieldError message={detailError(errors, field)} />
        </div>
      ))}
    </fieldset>
  );
}

export function SpecializedArtifactFields(props: SpecializedArtifactFieldsProps) {
  switch (props.activeType) {
    case "english_note":
      return <EnglishFields {...props} />;
    case "korean_note":
      return <KoreanFields {...props} />;
    case "devlog":
      return <DevlogFields {...props} />;
    case "taste_note":
      return <TasteFields {...props} />;
    case "conversation_reflection":
      return <ConversationFields {...props} />;
    case "marathon_reflection":
      return <MarathonFields {...props} />;
  }
}
