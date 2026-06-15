# Phase 3 Specialized Workflows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add validated English, Korean, Devlog, Taste, Conversation, and Marathon artifact workflows with optional atomic activity creation and contextual entry points.

**Architecture:** Keep the current artifact editor and persistence transaction as the shared shell. Add typed detail schemas and a workflow registry, render workflow-specific fields through one focused component, and extend existing Artifacts and Project pages rather than adding new dashboards.

**Tech Stack:** React 19, TypeScript, React Hook Form, Zod, Dexie, React Router, Vitest, Playwright, axe-core

---

## File Structure

**Create**

- `src/domain/specializedArtifacts.ts` - pure constants, defaults, normalization, word count, type guards, and display helpers.
- `src/domain/__tests__/specializedArtifacts.test.ts` - pure workflow helper and schema tests.
- `src/features/artifacts/SpecializedArtifactFields.tsx` - workflow-specific controls registered with the shared form.
- `src/features/artifacts/__tests__/specializedArtifactService.test.ts` - atomic save, metadata, defaults, and edit-preservation tests.
- `e2e/specialized-workflows.spec.ts` - editor integration plus desktop/mobile workflow acceptance coverage.

**Modify**

- `src/domain/types.ts` - add six typed artifact detail interfaces and union members.
- `src/domain/schemas.ts` - add six detail schemas to `artifactDetailsSchema`.
- `src/features/artifacts/artifactFormSchema.ts` - add the `details` discriminated union and input defaults.
- `src/features/artifacts/ArtifactForm.tsx` - initialize workflow defaults and render specialized fields.
- `src/features/artifacts/artifactService.ts` - save typed details and copy duration/classification to a linked activity.
- `src/features/artifacts/ArtifactEditorPage.tsx` - resolve URL type and `trackId`, then provide contextual defaults.
- `src/features/artifacts/ArtifactsPage.tsx` - add workflow shortcuts and taste-category filtering.
- `src/features/artifacts/ArtifactDetailPage.tsx` - display specialized detail summaries and conversation follow-up state.
- `src/features/projects/useProjectsData.ts` - query project artifacts with activities.
- `src/features/projects/ProjectDetailPage.tsx` - show artifact total/list and contextual workflow creation action.
- `src/test/builders.ts` - add an artifact builder.
- `e2e/accessibility.spec.ts` - cover representative specialized forms.
- `README.md` - list specialized workflow support.

### Task 1: Typed Detail Contracts And Validation

**Files:**
- Modify: `src/domain/types.ts`
- Modify: `src/domain/schemas.ts`
- Modify: `src/test/builders.ts`
- Create: `src/domain/__tests__/specializedArtifacts.test.ts`

- [ ] **Step 1: Write failing schema tests**

Create table-driven tests that parse one valid detail record for each kind and
reject invalid ratings, negative duration/distance, and unsafe taste links:

```ts
import {
  conversationDetailsSchema,
  devlogDetailsSchema,
  englishDetailsSchema,
  koreanDetailsSchema,
  marathonDetailsSchema,
  tasteDetailsSchema,
} from "../schemas";

describe("specialized artifact schemas", () => {
  it("accepts all six valid detail records", () => {
    expect(englishDetailsSchema.parse({
      kind: "english_note",
      practiceType: "technical_explanation",
      topic: "IndexedDB",
      durationMinutes: 20,
      confidence: 4,
      notes: "",
      mistakesNoticed: "Used an unclear verb",
      improvedVersion: "IndexedDB stores records locally.",
      template: "technical_explanation",
    }).kind).toBe("english_note");
    expect(koreanDetailsSchema.parse({
      kind: "korean_note",
      activityType: "vocabulary_review",
      wordsLearned: ["안녕"],
      phrasesLearned: [],
      source: "Notebook",
      durationMinutes: 10,
      enjoyment: "fun",
      notes: "",
    }).kind).toBe("korean_note");
    expect(devlogDetailsSchema.parse({
      kind: "devlog",
      devlogType: "product_devlog",
      wordCount: 120,
    }).kind).toBe("devlog");
    expect(tasteDetailsSchema.parse({
      kind: "taste_note",
      category: "software_app",
      location: "",
      firstImpression: "Calm",
      good: "Clear hierarchy",
      bad: "Dense settings",
      reasoning: "Progressive disclosure works",
      reusableInsight: "Hide secondary controls",
      photoReference: "https://example.com/reference",
    }).kind).toBe("taste_note");
    expect(conversationDetailsSchema.parse({
      kind: "conversation_reflection",
      activityType: "career_conversation",
      context: "Alumni dinner",
      personOrGroup: "Alumni",
      questionAsked: "What skill helped you most?",
      bestInsight: "Writing compounds",
      selfObservation: "I interrupted once",
      improvement: "Pause before responding",
      followUpAction: "Send a thank-you note",
      followUpCompleted: false,
    }).kind).toBe("conversation_reflection");
    expect(marathonDetailsSchema.parse({
      kind: "marathon_reflection",
      reflectionType: "long_run_reflection",
      distanceKm: 18,
      pace: "6:30/km",
      energy: 3,
      mentalCondition: "Steady",
      worked: "Early fueling",
      failed: "Started too fast",
      lesson: "Hold pace for the first 5 km",
    }).kind).toBe("marathon_reflection");
  });

  it("rejects invalid numeric values and unsafe links", () => {
    expect(() => englishDetailsSchema.parse({
      kind: "english_note",
      practiceType: "speaking",
      topic: "Career",
      durationMinutes: -1,
      confidence: 6,
      notes: "",
      mistakesNoticed: "",
      improvedVersion: "",
      template: "none",
    })).toThrow();
    expect(() => tasteDetailsSchema.parse({
      kind: "taste_note",
      category: "product",
      firstImpression: "Good",
      good: "Form",
      bad: "Weight",
      reasoning: "Balanced",
      reusableInsight: "Reduce weight",
      photoReference: "javascript:alert(1)",
    })).toThrow();
  });
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm test -- src/domain/__tests__/specializedArtifacts.test.ts`

Expected: FAIL because the specialized schemas are not exported.

- [ ] **Step 3: Add typed detail interfaces and schema exports**

Add interfaces to `src/domain/types.ts` with the exact discriminators:

```ts
export type EnglishArtifactDetails = {
  kind: "english_note";
  practiceType: "speaking" | "writing" | "voice_recording" |
    "technical_explanation" | "career_answer" | "reflection" |
    "devlog_drafting" | "mock_interview";
  topic: string;
  durationMinutes: number;
  confidence: 1 | 2 | 3 | 4 | 5;
  notes: string;
  mistakesNoticed: string;
  improvedVersion: string;
  template: "none" | "technical_explanation" | "career_answer" | "weekly_reflection";
  [key: string]: unknown;
};
```

Add these remaining interfaces, then include all six in `ArtifactDetails`:

```ts
export type KoreanArtifactDetails = {
  kind: "korean_note";
  activityType: "vocabulary_review" | "hangul_reading" | "listening" |
    "short_lesson" | "grammar_note" | "media_observation" | "phrase_collection";
  wordsLearned: string[];
  phrasesLearned: string[];
  source: string;
  durationMinutes: number;
  enjoyment: "fun" | "neutral" | "difficult";
  notes: string;
  [key: string]: unknown;
};

export type DevlogArtifactDetails = {
  kind: "devlog";
  devlogType: "product_devlog" | "technical_note" | "weekly_reflection" |
    "marathon_essay" | "learning_note" | "taste_reflection" |
    "conversation_insight" | "portfolio_post";
  wordCount: number;
  [key: string]: unknown;
};

export type TasteArtifactDetails = {
  kind: "taste_note";
  category: "food_drink" | "place" | "product" | "visual_design" |
    "storytelling" | "lifestyle" | "software_app" | "city_observation" |
    "coffee_shop" | "custom";
  customCategory?: string;
  location?: string;
  firstImpression: string;
  good: string;
  bad: string;
  reasoning: string;
  reusableInsight: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  photoReference?: string;
  [key: string]: unknown;
};

export type ConversationArtifactDetails = {
  kind: "conversation_reflection";
  activityType: "intentional_question" | "deep_conversation" | "alumni_dinner" |
    "career_conversation" | "friend_conversation" | "family_conversation" |
    "community_conversation" | "follow_up";
  context: string;
  personOrGroup?: string;
  questionAsked: string;
  bestInsight: string;
  selfObservation: string;
  improvement: string;
  followUpAction: string;
  followUpCompleted: boolean;
  [key: string]: unknown;
};

export type MarathonArtifactDetails = {
  kind: "marathon_reflection";
  reflectionType: "long_run_reflection" | "training_lesson" |
    "race_preparation" | "recovery_note" | "discipline_note";
  distanceKm?: number;
  pace?: string;
  energy: 1 | 2 | 3 | 4 | 5;
  mentalCondition: string;
  worked: string;
  failed: string;
  lesson: string;
  [key: string]: unknown;
};
```

In `src/domain/schemas.ts`, export each schema and add it before the generic
schema in `artifactDetailsSchema`. Use `.catchall(z.unknown())` on every details
object to preserve compatible unknown keys. Use a reusable safe optional
reference schema:

```ts
const optionalHttpOrText = z.string().refine((value) => {
  if (!value.trim() || !value.includes(":")) return true;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return true;
  }
}, "Use plain text or an HTTP(S) link.");
```

Add `buildArtifact()` to `src/test/builders.ts` with generic details by default.

- [ ] **Step 4: Run domain tests**

Run: `npm test -- src/domain/__tests__/specializedArtifacts.test.ts src/domain/__tests__/schemas.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain src/test/builders.ts
git commit -m "feat: add specialized artifact detail schemas"
```

### Task 2: Workflow Registry, Defaults, Templates, And Normalizers

**Files:**
- Create: `src/domain/specializedArtifacts.ts`
- Modify: `src/domain/__tests__/specializedArtifacts.test.ts`

- [ ] **Step 1: Write failing helper tests**

Append tests for type guards, activity defaults, track mappings, Korean list
normalization, templates, and word count:

```ts
import {
  devlogTemplate,
  englishTemplates,
  getSpecializedWorkflow,
  isSpecializedArtifactType,
  normalizeLineList,
  wordCount,
} from "../specializedArtifacts";

it("defines stable workflow defaults", () => {
  expect(getSpecializedWorkflow("english_note")).toMatchObject({
    defaultTrackId: "english",
    createActivityByDefault: true,
  });
  expect(getSpecializedWorkflow("devlog")).toMatchObject({
    defaultTrackId: "devlog",
    createActivityByDefault: false,
  });
  expect(getSpecializedWorkflow("marathon_reflection")).toMatchObject({
    createActivityByDefault: true,
  });
  expect(isSpecializedArtifactType("weekly_review")).toBe(false);
});

it("normalizes lists and derives words", () => {
  expect(normalizeLineList(" 안녕\\n\\n감사합니다 \\n안녕")).toEqual([
    "안녕",
    "감사합니다",
  ]);
  expect(wordCount("  one   two\\nthree ")).toBe(3);
  expect(wordCount("")).toBe(0);
});

it("exposes approved templates", () => {
  expect(englishTemplates.technical_explanation).toContain("What did I explain?");
  expect(devlogTemplate).toContain("## What I built");
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm test -- src/domain/__tests__/specializedArtifacts.test.ts`

Expected: FAIL because `specializedArtifacts.ts` does not exist.

- [ ] **Step 3: Implement the registry and pure helpers**

Export:

```ts
export const specializedArtifactTypes = [
  "english_note",
  "korean_note",
  "devlog",
  "taste_note",
  "conversation_reflection",
  "marathon_reflection",
] as const;

export const specializedWorkflows = {
  english_note: {
    label: "English practice",
    defaultTrackId: "english",
    createActivityByDefault: true,
  },
  korean_note: {
    label: "Korean learning",
    defaultTrackId: "korean",
    createActivityByDefault: true,
  },
  devlog: {
    label: "Devlog",
    defaultTrackId: "devlog",
    createActivityByDefault: false,
  },
  taste_note: {
    label: "Taste note",
    defaultTrackId: "taste",
    createActivityByDefault: false,
  },
  conversation_reflection: {
    label: "Conversation reflection",
    defaultTrackId: "conversation",
    createActivityByDefault: true,
  },
  marathon_reflection: {
    label: "Marathon reflection",
    createActivityByDefault: true,
  },
} as const;
```

Also export PRD option arrays, the ten conversation questions, three English
templates, the devlog template, `defaultDetails(type)`, `normalizeLineList`,
`wordCount`, `isSpecializedArtifactType`, and `getSpecializedWorkflow`.

- [ ] **Step 4: Run the focused test**

Run: `npm test -- src/domain/__tests__/specializedArtifacts.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/specializedArtifacts.ts src/domain/__tests__/specializedArtifacts.test.ts
git commit -m "feat: define specialized workflow registry"
```

### Task 3: Specialized Form Schema And Fields

**Files:**
- Modify: `src/features/artifacts/artifactFormSchema.ts`
- Create: `src/features/artifacts/SpecializedArtifactFields.tsx`
- Modify: `src/features/artifacts/ArtifactForm.tsx`

- [ ] **Step 1: Add failing form-schema tests**

Add `src/features/artifacts/__tests__/artifactFormSchema.test.ts`:

```ts
import { artifactFormSchema } from "../artifactFormSchema";
import { defaultDetails } from "../../../domain/specializedArtifacts";

it("validates matching specialized details", () => {
  const result = artifactFormSchema.parse({
    title: "Technical explanation",
    type: "english_note",
    date: "2026-06-15",
    trackId: "english",
    tags: "",
    status: "completed",
    content: "",
    externalLink: "",
    createActivity: true,
    details: defaultDetails("english_note"),
  });
  expect(result.details.kind).toBe("english_note");
});

it("rejects mismatched type and details", () => {
  expect(() => artifactFormSchema.parse({
    title: "Wrong",
    type: "english_note",
    date: "2026-06-15",
    trackId: "english",
    tags: "",
    status: "drafting",
    content: "",
    externalLink: "",
    createActivity: true,
    details: defaultDetails("korean_note"),
  })).toThrow();
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- src/features/artifacts/__tests__/artifactFormSchema.test.ts`

Expected: FAIL because the form has no `details` field.

- [ ] **Step 3: Extend the form schema**

Create a union where each specialized artifact type requires its matching
details schema, while non-specialized types use generic details:

```ts
const sharedFields = z.object({
  title: z.string().trim().min(1, "Enter a title."),
  date: z.string().refine(isLocalDate, "Choose a valid date."),
  trackId: z.string(),
  tags: z.string(),
  status: artifactStatusSchema,
  content: z.string(),
  externalLink: safeExternalLinkInput,
  createActivity: z.boolean(),
});

export const artifactFormSchema = z.discriminatedUnion("type", [
  sharedFields.extend({ type: z.literal("english_note"), details: englishDetailsSchema }),
  sharedFields.extend({ type: z.literal("korean_note"), details: koreanDetailsSchema }),
  sharedFields.extend({ type: z.literal("devlog"), details: devlogDetailsSchema }),
  sharedFields.extend({ type: z.literal("taste_note"), details: tasteDetailsSchema }),
  sharedFields.extend({
    type: z.literal("conversation_reflection"),
    details: conversationDetailsSchema,
  }),
  sharedFields.extend({
    type: z.literal("marathon_reflection"),
    details: marathonDetailsSchema,
  }),
  sharedFields.extend({
    type: z.enum(["custom", "vinance_milestone", "weekly_review", "monthly_review"]),
    details: genericArtifactDetailsSchema,
  }),
]);
```

- [ ] **Step 4: Implement workflow fields**

`SpecializedArtifactFields` accepts `type`, `register`, `setValue`, `watch`, and
`errors` from React Hook Form. Render native labeled controls for the active
details kind. Use `details.<field>` registration paths.

Template buttons must call:

```ts
function applyContentTemplate(template: string) {
  const current = watch("content");
  if (current.trim() && !window.confirm("Replace the current content with this template?")) {
    return;
  }
  setValue("content", template, { shouldDirty: true, shouldValidate: true });
}
```

Korean word/phrase textareas convert line-separated text to arrays with
`setValue`. Devlog renders a read-only live word count. Conversation renders the
question bank selector plus an editable question and labeled follow-up checkbox.

- [ ] **Step 5: Integrate fields and defaults into `ArtifactForm`**

Use `useSearchParams` context supplied by the editor through explicit props:

```ts
type ArtifactFormProps = {
  artifact?: Artifact;
  tracks: Track[];
  today: LocalDate;
  initialType?: Artifact["type"];
  initialTrackId?: string;
  onSubmit: (values: ArtifactFormValues) => Promise<void>;
};
```

Initialize `details` from the existing specialized artifact or
`defaultDetails(initialType)`. Initialize `createActivity` from the registry for
new specialized records. Watch `type`; when it changes, confirm before replacing
non-empty incompatible details, then apply matching details/default activity and
default track if available.

- [ ] **Step 6: Run focused tests and typecheck**

Run: `npm test -- src/features/artifacts/__tests__/artifactFormSchema.test.ts && npm run typecheck`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/artifacts
git commit -m "feat: add specialized artifact form fields"
```

### Task 4: Atomic Specialized Save Service

**Files:**
- Modify: `src/features/artifacts/artifactService.ts`
- Create: `src/features/artifacts/__tests__/specializedArtifactService.test.ts`
- Modify: `src/features/artifacts/__tests__/artifactService.test.ts`

- [ ] **Step 1: Write failing service tests**

Test an English artifact with activity, a Devlog without activity, and an edit
that preserves an unknown details key:

```ts
it("creates typed details and activity metadata atomically", async () => {
  const database = createTestDatabase();
  await initializeDatabase(database, { timeZone: "UTC" });
  const track = await database.tracks.get("english");
  const artifact = await saveArtifact({
    database,
    track: track!,
    values: englishFormValues({
      details: {
        ...defaultDetails("english_note"),
        topic: "Architecture",
        durationMinutes: 25,
      },
    }),
    now: new Date("2026-06-15T00:00:00.000Z"),
  });
  expect(artifact.details.kind).toBe("english_note");
  const activity = await database.activities.where("trackId").equals("english").first();
  expect(activity).toMatchObject({
    durationMinutes: 25,
    metadata: {
      artifactType: "english_note",
      workflowType: "speaking",
    },
  });
  expect(activity?.artifactIds).toContain(artifact.id);
});

it("derives devlog word count without creating an activity by default", async () => {
  const artifact = await saveArtifact({
    database,
    values: devlogFormValues({ content: "one two  three" }),
  });
  expect(artifact.details).toMatchObject({ kind: "devlog", wordCount: 3 });
  expect(await database.activities.count()).toBe(0);
});
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `npm test -- src/features/artifacts/__tests__/specializedArtifactService.test.ts`

Expected: FAIL because `saveArtifact` and typed detail persistence do not exist.

- [ ] **Step 3: Generalize `saveGenericArtifact` to `saveArtifact`**

Build details from validated form values. For Devlog, override `wordCount` using
the pure helper. Preserve unknown existing keys only when the discriminator is
unchanged:

```ts
const details = values.type === "devlog"
  ? { ...preservedDetails, ...values.details, wordCount: wordCount(values.content) }
  : { ...preservedDetails, ...values.details };
```

When creating an activity, derive:

```ts
const durationMinutes = getWorkflowDuration(values.details);
const workflowType = getWorkflowClassification(values.details);

metadata: {
  artifactType: artifact.type,
  ...(workflowType ? { workflowType } : {}),
},
...(durationMinutes ? { durationMinutes } : {}),
```

Keep `putArtifactWithLinks` as the only write path. Rename
`saveGenericArtifact` to `saveArtifact` and update every import and call in
`ArtifactEditorPage.tsx` and existing artifact service tests in this task.

- [ ] **Step 4: Run service and relationship tests**

Run: `npm test -- src/features/artifacts/__tests__ src/db/__tests__/relationships.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/artifacts/artifactService.ts src/features/artifacts/__tests__
git commit -m "feat: save specialized artifacts atomically"
```

### Task 5: Editor Context And Specialized Detail Display

**Files:**
- Modify: `src/features/artifacts/ArtifactEditorPage.tsx`
- Modify: `src/features/artifacts/ArtifactDetailPage.tsx`
- Create: `e2e/specialized-workflows.spec.ts`

- [ ] **Step 1: Add editor integration coverage**

Create the first Playwright test:

```ts
import { expect, test } from "@playwright/test";

test.describe("specialized artifact workflows", () => {
  test("loads English workflow defaults from project context", async ({ page }) => {
    await page.goto("/artifacts/new/english_note?trackId=english");
    await expect(page.getByLabel("Practice type")).toBeVisible();
    await expect(page.getByLabel("Project")).toHaveValue("english");
    await expect(
      page.getByRole("checkbox", { name: /Also count as an activity/ }),
    ).toBeChecked();
  });
});
```

- [ ] **Step 2: Run the integration test and verify failure**

Run: `npx playwright test e2e/specialized-workflows.spec.ts -g "loads English workflow defaults"`

Expected: FAIL because URL track context and specialized fields are not wired.

- [ ] **Step 3: Resolve safe URL defaults in the editor**

Use `useSearchParams`. Accept the route type only when it is a known artifact
type; otherwise use `custom`. Accept `trackId` only when it matches an active
loaded track. Prefer the explicit query track over the registry default:

```ts
const requestedTrackId = searchParams.get("trackId") ?? "";
const initialTrackId =
  activeTracks.some((track) => track.id === requestedTrackId)
    ? requestedTrackId
    : workflow?.defaultTrackId;
```

Pass `initialTrackId` to `ArtifactForm` and call `saveArtifact`.

- [ ] **Step 4: Render typed details on artifact detail**

Create a small local `ArtifactDetailsSummary` switch or a focused helper
component in the same feature folder. Display workflow labels and values, omit
empty optional values, render arrays as comma-separated text, and render:

```tsx
{details.kind === "conversation_reflection" ? (
  <p>
    Follow-up: {details.followUpCompleted ? "Completed" : "Open"}
  </p>
) : null}
```

Do not render user text as HTML. Photo references that parse as HTTP(S) may use
the existing safe external-link pattern; plain references render as text.

- [ ] **Step 5: Run integration tests, lint, and typecheck**

Run: `npm test -- src/features/artifacts && npm run lint && npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/artifacts
git commit -m "feat: integrate specialized artifact editor"
```

### Task 6: Artifacts Shortcuts And Taste Filtering

**Files:**
- Modify: `src/features/artifacts/ArtifactsPage.tsx`
- Modify: `src/domain/specializedArtifacts.ts`
- Modify: `src/domain/__tests__/specializedArtifacts.test.ts`

- [ ] **Step 1: Add failing filter-helper test**

Extract a pure `matchesArtifactFilters` helper and test taste category:

```ts
it("filters taste notes by category", () => {
  const artifact = buildArtifact({
    type: "taste_note",
    details: {
      ...defaultDetails("taste_note"),
      category: "software_app",
    },
  });
  expect(matchesArtifactFilters(artifact, {
    query: "",
    type: "taste_note",
    status: "",
    trackId: "",
    from: "",
    to: "",
    showArchived: false,
    tasteCategory: "software_app",
  })).toBe(true);
  expect(matchesArtifactFilters(artifact, {
    query: "",
    type: "taste_note",
    status: "",
    trackId: "",
    from: "",
    to: "",
    showArchived: false,
    tasteCategory: "food_drink",
  })).toBe(false);
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- src/domain/__tests__/specializedArtifacts.test.ts`

Expected: FAIL because the filter helper is absent.

- [ ] **Step 3: Add six workflow shortcuts**

Render links using `specializedWorkflows`:

```tsx
<div className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
  {specializedArtifactTypes.map((artifactType) => (
    <Button key={artifactType} variant="secondary" asChild>
      <Link to={`/artifacts/new/${artifactType}`}>
        New {specializedWorkflows[artifactType].label}
      </Link>
    </Button>
  ))}
</div>
```

Keep the existing generic “New artifact” action. Add a taste category select
only when `type === "taste_note"` and apply it through the pure helper.

- [ ] **Step 4: Run tests and build**

Run: `npm test -- src/domain/__tests__/specializedArtifacts.test.ts && npm run build`

Expected: PASS. The existing large-chunk warning may remain non-failing.

- [ ] **Step 5: Commit**

```bash
git add src/domain src/features/artifacts/ArtifactsPage.tsx
git commit -m "feat: add specialized artifact discovery"
```

### Task 7: Project Context, Artifact Totals, And Entry Actions

**Files:**
- Modify: `src/features/projects/useProjectsData.ts`
- Modify: `src/features/projects/ProjectDetailPage.tsx`
- Modify: `src/db/repositories.ts`
- Modify: `src/db/__tests__/repositories.test.ts`

- [ ] **Step 1: Write failing repository test**

Add `ArtifactRepository.listByTrack` coverage:

```ts
it("lists artifacts for one project newest first", async () => {
  await database.artifacts.bulkPut([
    buildArtifact({ id: "old", trackId: "english", date: "2026-06-01" }),
    buildArtifact({ id: "new", trackId: "english", date: "2026-06-15" }),
    buildArtifact({ id: "other", trackId: "korean", date: "2026-06-16" }),
  ]);
  await expect(new ArtifactRepository(database).listByTrack("english"))
    .resolves.toMatchObject([{ id: "new" }, { id: "old" }]);
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- src/db/__tests__/repositories.test.ts`

Expected: FAIL because `listByTrack` is not implemented.

- [ ] **Step 3: Add the repository query and project hook data**

Implement:

```ts
listByTrack(trackId: EntityId): Promise<Artifact[]> {
  return this.database.artifacts
    .where("trackId")
    .equals(trackId)
    .reverse()
    .sortBy("date");
}
```

In `useProjectData`, query activities and artifacts in parallel. Exclude archived
artifacts from the displayed total/list.

- [ ] **Step 4: Add contextual workflow action and artifact section**

Map stable track IDs to artifact types:

```ts
const artifactTypeByTrack = {
  english: "english_note",
  korean: "korean_note",
  devlog: "devlog",
  taste: "taste_note",
  conversation: "conversation_reflection",
} as const;
```

For matching active tracks, add:

```tsx
<Button variant="secondary" asChild>
  <Link to={`/artifacts/new/${artifactType}?trackId=${track.id}`}>
    Log {specializedWorkflows[artifactType].label}
  </Link>
</Button>
```

Add an “Artifacts” total card and a section of links to artifact detail. For
tracks without a specialized mapping, show artifact totals but no specialized
action.

- [ ] **Step 5: Run repository tests and build**

Run: `npm test -- src/db/__tests__/repositories.test.ts && npm run build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/db src/features/projects
git commit -m "feat: connect specialized workflows to projects"
```

### Task 8: End-To-End, Offline, Accessibility, And Documentation

**Files:**
- Modify: `e2e/specialized-workflows.spec.ts`
- Modify: `e2e/accessibility.spec.ts`
- Modify: `README.md`

- [ ] **Step 1: Add six creation scenarios**

Use a data-driven Playwright test for basic creation:

```ts
const workflows = [
  {
    path: "/artifacts/new/english_note",
    title: "Architecture explanation",
    fields: [["Topic", "IndexedDB"]],
  },
  {
    path: "/artifacts/new/korean_note",
    title: "Vocabulary review",
    fields: [["Source", "Notebook"]],
  },
  {
    path: "/artifacts/new/devlog",
    title: "Week 1 devlog",
    fields: [],
  },
  {
    path: "/artifacts/new/taste_note",
    title: "Calm product design",
    fields: [["First impression", "Focused"]],
  },
  {
    path: "/artifacts/new/conversation_reflection",
    title: "Alumni dinner",
    fields: [["Conversation context", "Career discussion"]],
  },
  {
    path: "/artifacts/new/marathon_reflection",
    title: "Long run lesson",
    fields: [["Mental condition", "Steady"]],
  },
] as const;
```

For each workflow, fill all required fields, submit, and assert the detail page
heading plus one specialized summary value.

- [ ] **Step 2: Add behavioral browser coverage**

Add tests that:

- launch English from `/projects/english` and assert project preselection;
- assert English/Korean/Conversation/Marathon activity boxes default checked;
- assert Devlog/Taste activity boxes default unchecked;
- apply an English template and the Devlog template;
- select a conversation question and complete its follow-up;
- create two taste notes and filter by category;
- assert project artifact total increments;
- create one specialized artifact offline after `navigator.serviceWorker.ready`.

- [ ] **Step 3: Add accessibility routes**

Append representative routes:

```ts
"/artifacts/new/english_note",
"/artifacts/new/taste_note",
"/artifacts/new/conversation_reflection",
```

Keep the existing serious/critical WCAG assertion.

- [ ] **Step 4: Run targeted browser tests**

Run: `npx playwright test e2e/specialized-workflows.spec.ts`

Expected: PASS on configured desktop and mobile projects.

- [ ] **Step 5: Update README**

Document the six specialized workflows, contextual project actions, offline
creation, and the fact that Vinance feature/task tracking remains the next
Phase 3 slice.

- [ ] **Step 6: Run the complete verification suite**

Run:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
git diff --check
```

Expected:

- TypeScript: PASS
- ESLint: PASS
- Vitest: all tests pass
- Vite build: PASS; existing chunk-size warning is non-failing
- Playwright: all desktop, mobile, offline, and axe tests pass
- `git diff --check`: no output

- [ ] **Step 7: Commit**

```bash
git add README.md e2e
git commit -m "test: cover specialized artifact workflows"
```

- [ ] **Step 8: Confirm repository state**

Run: `git status --short`

Expected: only the pre-existing untracked `docs/PRD.md` and `docs/SDD.md` remain.
