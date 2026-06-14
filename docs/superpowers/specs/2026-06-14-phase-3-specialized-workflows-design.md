# Phase 3 Specialized Workflows Design

## Scope

This slice implements the six specialized artifact workflows from Phase 3:

- English practice
- Korean learning
- Devlogs
- Taste notes
- Conversation reflections
- Marathon reflections

Vinance feature and task tracking is intentionally excluded. It will be a
separate Phase 3 slice because it owns distinct tables, relationships, and
completion rules.

The slice reuses the current Artifacts and Project detail routes. It does not
add dedicated workflow dashboards or Phase 5 analytics.

## Goals

1. Give each supported workflow a form matching the PRD fields and terminology.
2. Store workflow-specific values as validated, typed artifact details.
3. Reuse the existing atomic artifact and activity relationship service.
4. Provide creation shortcuts from Artifacts and matching Project detail pages.
5. Preserve offline behavior, accessibility, mobile usability, and safe links.
6. Show workflow totals through existing project and artifact views.

## Architecture

The existing artifact editor remains the shared route and application shell.
A specialized workflow registry keyed by artifact type supplies:

- form defaults,
- a Zod details schema,
- a typed workflow field component,
- activity-creation defaults,
- the expected track where applicable,
- display labels and artifact-list filter metadata.

Supported registry keys are:

```ts
type SpecializedArtifactType =
  | "english_note"
  | "korean_note"
  | "devlog"
  | "taste_note"
  | "conversation_reflection"
  | "marathon_reflection";
```

The editor validates shared artifact fields and specialized details as one
submission. The application service builds an artifact and optionally an
activity, then uses the existing reciprocal-link transaction.

Generic artifacts and weekly or monthly reviews continue using their existing
paths and data shapes.

## Domain Model

`ArtifactDetails` gains one discriminated detail type for every workflow. The
discriminator matches the artifact type. Existing unknown keys are retained
when editing a record so backups from newer compatible schemas are not
destructively narrowed.

### English Details

Fields:

- practice type
- topic
- duration in minutes
- confidence rating from 1 through 5
- notes
- mistakes noticed
- improved version
- selected template

Supported practice types include speaking, writing, voice recording, technical
explanation, career answer, reflection, devlog drafting, and mock interview
preparation.

Templates provide editable starting content for technical explanations, career
answers, and weekly reflections. Applying a template never overwrites non-empty
content without confirmation.

### Korean Details

Fields:

- activity type
- words learned
- phrases learned
- source
- duration in minutes
- enjoyment as `fun`, `neutral`, or `difficult`
- notes

Supported activity types follow the PRD list. Words and phrases are stored as
normalized string arrays and rendered as editable line-separated values.

### Devlog Details

Fields:

- devlog type
- word count

Shared artifact fields provide title, status, content, published link, related
project, tags, and dates. Word count is derived from trimmed content at save
time and is never directly editable.

The default devlog template is available as an explicit action. Applying it to
non-empty content requires confirmation.

### Taste Details

Fields:

- category
- custom category when category is custom
- location
- first impression
- what is good
- what is not good
- why it works or does not work
- reusable insight
- optional rating from 1 through 5
- optional photo-reference text or HTTP(S) link

Shared fields provide the item or place title, date, project link, tags, content,
and artifact status.

### Conversation Details

Fields:

- activity type
- context
- optional person or group
- question asked
- best insight heard
- self-observation
- improvement
- follow-up action
- follow-up completion state

The PRD question bank is built in. Selecting a question copies it into an
editable question field. A custom prompt is always permitted. Follow-up
completion can be toggled while creating or editing the artifact.

### Marathon Details

Fields:

- reflection type
- optional distance in kilometers
- optional pace text
- energy rating from 1 through 5
- mental condition
- what worked
- what failed
- marathon lesson

This remains reflection support, not a run-tracking subsystem. It does not add
GPS, splits, route, or health integrations.

## Form Behavior

The shared artifact form retains title, type, date, project, status, content,
tags, external link, existing activity links, and optional new activity
creation.

When a specialized type is selected, its fields render beneath the shared
fields. Changing between specialized types resets incompatible details only
after confirmation when the current specialized fields contain user input.

Activity creation defaults:

| Workflow | Default |
| --- | --- |
| English | enabled |
| Korean | enabled |
| Devlog | disabled |
| Taste | disabled |
| Conversation | enabled |
| Marathon | enabled |

Users may override the default before saving. A created activity receives the
artifact date, title, tags, selected track, and track default points. Duration
is copied from specialized details when present. Workflow classification is
stored in activity metadata for future analytics.

Creation from a Project detail page adds a `trackId` query parameter. The editor
uses it only when it references an active track. Workflow shortcuts use stable
default-track mappings:

| Workflow | Track |
| --- | --- |
| English | `english` |
| Korean | `korean` |
| Devlog | `devlog` |
| Taste | `taste` |
| Conversation | `conversation` |
| Marathon | no forced track; use the launching project or explicit selection |

## Navigation And Existing Views

Artifacts displays six clearly labeled creation shortcuts above the existing
list and retains the generic artifact action. Its current type filter supports
all specialized types. Taste category filtering is added when the selected type
is `taste_note`.

Matching Project detail pages display a contextual creation action. Project
detail also displays:

- the number of linked activities already shown by the existing history,
- the number of non-archived artifacts linked to the project,
- a filtered list or link into Artifacts for those records.

No new top-level navigation item is introduced.

## Save And Edit Flow

1. Resolve the requested artifact type and optional project context.
2. Load the existing artifact, tracks, settings, and activity links.
3. Initialize shared and specialized values.
4. Validate the shared schema and the type-specific details schema.
5. Derive fields such as devlog word count.
6. Build the artifact while preserving audit fields and compatible unknown
   detail keys.
7. Optionally build one linked activity.
8. Commit the artifact, activity, and reciprocal links atomically.
9. Navigate to artifact detail and announce success.

Publishing or completing an artifact never creates another activity
automatically.

## Validation And Error Handling

- Required PRD fields show field-level errors on blur and submit.
- Durations and distances must be non-negative.
- Ratings accept only their documented ranges.
- External and photo-reference links accept only HTTP or HTTPS.
- Plain photo-reference text remains valid.
- Failed validation performs no write and keeps input visible.
- Failed storage transactions leave every involved record unchanged.
- Existing storage quota and unavailable-database messages remain in use.
- Template replacement of non-empty content requires confirmation.
- Unknown or unsupported URL artifact types fall back to `custom`.

## Accessibility And Mobile

- Every field has a visible label.
- Workflow shortcuts have distinct accessible names.
- Question-bank and template controls are keyboard operable.
- Ratings use labeled native selects rather than pointer-only widgets.
- Follow-up completion uses a labeled checkbox.
- Form sections remain single-column on narrow screens and use existing touch
  target sizing.
- Status, enjoyment, and completion are communicated with text, not color alone.

## Testing

### Unit And Repository Tests

- Every specialized details schema accepts valid records and rejects invalid
  ratings, duration, distance, and unsafe links.
- Line-separated Korean words and phrases normalize predictably.
- Devlog word count handles empty content and repeated whitespace.
- Template defaults and activity-creation defaults match this design.
- Saving every workflow creates the expected detail discriminator.
- Optional activity creation copies duration and workflow metadata.
- Editing preserves existing links, audit fields, and compatible unknown keys.
- Transaction failure does not leave a partial artifact/activity pair.

### Browser Tests

Desktop and mobile coverage includes:

- all six Artifacts shortcuts,
- contextual launch from matching Project detail pages,
- creation and editing for every specialized workflow,
- default and overridden activity creation,
- template application,
- conversation question bank and follow-up completion,
- taste category filtering,
- project artifact totals,
- offline creation,
- serious axe accessibility checks for representative forms.

## Acceptance Criteria

The slice is complete when:

1. All six workflows can create and edit typed artifacts offline.
2. Required PRD fields and workflow classifications are stored and displayed.
3. Activity defaults follow the approved workflow matrix and remain overridable.
4. Specialized artifact/activity writes are atomic and reciprocally linked.
5. Artifacts and matching Project pages provide direct creation entry points.
6. Existing views expose specialized records and workflow totals without new
   dashboard routes.
7. Automated unit, repository, browser, mobile, offline, and accessibility tests
   pass.

