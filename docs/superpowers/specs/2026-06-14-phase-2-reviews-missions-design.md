# No Zero Phase 2 Reviews and Missions Design

## 1. Purpose

Phase 2 extends the Phase 1 core tracker so a complete week and month can be
reviewed without another tool. It adds generic artifacts, weekly reviews,
monthly missions, and the calendar while preserving the SDD's local-first
architecture and schema-v1 storage contracts.

Phase 2 succeeds when the user can collect evidence, inspect consistency by
date, close a week intentionally, and manage the June through December 2026
missions with all relationships persisted atomically.

## 2. Scope

### 2.1 Included

- Generic artifact list, create, edit, archive, filtering, and detail workflows.
- Activity-to-artifact and mission-to-artifact relationships.
- Weekly review dashboard, draft, completion, and historical navigation.
- Monthly mission seed data, checklist management, notes, progress, and review.
- Monthly calendar with activity status, points, tracks, filtering, and day
  details.
- Responsive navigation for Calendar, Weekly Review, Missions, and Artifacts.
- Repository and service transaction coverage for relationship updates.
- Extended backup verification for artifacts and missions.
- Offline, accessibility, component, and production browser coverage.

### 2.2 Deferred

Typed English, Korean, Vinance, Devlog, Taste, Conversation, and Marathon
editors remain Phase 3. Import, merge, selective export, Markdown export,
storage reporting, reset, reminders, search, analytics, projections, semester
summary, and year-end review remain later phases.

Phase 2 may create artifacts of every SDD type through the generic editor, but
does not expose type-specific detail fields before their specialized workflows.

## 3. Architecture

New code follows the existing feature boundaries:

```text
src/
  db/                         artifact and mission repositories, relationships
  domain/                     artifact/mission schemas and calendar selectors
  features/
    artifacts/                list, editor, detail, archive, filters
    calendar/                 month projection and day-detail workflow
    missions/                 mission list, checklist, notes, monthly review
    reviews/                  weekly summary and review artifact workflow
  seed/                       versioned mission records
```

Feature UI uses repository interfaces and live queries. Application services
own validation and atomic multi-table writes. Calendar and review statistics
are pure selectors over bounded records. Artifacts and missions use the
schema-v1 tables already declared in Phase 1, so no database version increment
is required unless implementation reveals an index mismatch.

## 4. Routes and Navigation

Phase 2 adds:

| Route | Behavior |
| --- | --- |
| `/calendar` | Current or selected month calendar |
| `/reviews/weekly` | Current or selected weekly review |
| `/missions` | Mission timeline with current month emphasized |
| `/missions/:month` | Mission details and checklist |
| `/artifacts` | Filterable artifact collection |
| `/artifacts/new/:type?` | Generic artifact editor |
| `/artifacts/:artifactId` | Artifact detail and edit |

Desktop navigation adds all four top-level destinations. Mobile bottom
navigation remains focused on Today, Projects, and Calendar; Reviews, Missions,
Artifacts, and Settings appear in the overflow menu. Route labels and
capabilities remain equivalent between layouts.

## 5. Generic Artifacts

### 5.1 Supported Fields

The generic editor supports:

- title,
- type,
- date,
- optional project,
- tags,
- status,
- Markdown-compatible plain-text content,
- optional external HTTP(S) link.

Content is stored and rendered as escaped plain text in Phase 2. Rich Markdown
preview is deferred until a sanitizer is deliberately selected. External links
reject non-HTTP(S) schemes and open with `noopener noreferrer`.

### 5.2 Creation and Editing

New artifacts default to today's configured local date, `drafting` status, no
project, no tags, empty content, and type `custom` unless supplied by the route.
The editor validates on blur and submit, warns on unsaved route dismissal, and
preserves input after failures.

Editing preserves ID and `createdAt`. Archiving is the default removal action.
Archived artifacts are excluded from default counts and lists but can be shown
with a status filter and restored.

### 5.3 Activity Relationships

The generic artifact editor may optionally:

1. link existing activities,
2. create one completed activity for the artifact's project and date.

Creating an artifact plus activity is one transaction. The user must explicitly
enable activity creation; changing an artifact to published or completed never
creates another activity implicitly.

Updating links rewrites reciprocal `Activity.artifactIds` values in the same
transaction. Archiving an artifact preserves links. Hard deletion is not
exposed in Phase 2. Repository support for future deletion removes the artifact
ID from activities and missions atomically.

### 5.4 List and Filters

The Artifacts route supports:

- text matching over title, content, and tags,
- type,
- status,
- project,
- date range,
- archived inclusion.

Indexed criteria narrow candidates before normalized in-memory text matching.
Results sort by date descending, then `updatedAt` descending.

## 6. Weekly Reviews

### 6.1 Period Selection

Weeks follow `AppSettings.weekStartsOn`. The route opens the week containing
today and allows previous/next week navigation within the challenge range.
Future weeks cannot be selected.

### 6.2 Summary

The review dashboard derives:

- inclusive week dates,
- weekly points and status,
- active day count,
- session count by project,
- missing weekly targets,
- artifacts created in the week,
- highest-progress project,
- lowest target-completion project.

Archived tracks remain in historical session totals but are excluded from
current missing-target and weakest-project prompts.

### 6.3 Draft and Completion Rule

A weekly review is a `weekly_review` artifact with deterministic details keyed
by `weekStart`. Only one non-archived review may exist per week.

The current week can be saved as a draft at any time. Drafts use `drafting`
status and remain editable. A review can be marked completed only after the
configured week has ended in the user's time zone. Previous completed reviews
remain editable and retain `completed` status unless the user explicitly
returns them to draft.

This rule prevents premature closure while still allowing reflection during
the week. The UI clearly shows when final completion becomes available.

### 6.4 Review Fields

The form implements the SDD `WeeklyReviewDetails` contract:

- went well,
- skipped or avoided,
- optional best artifact,
- optional weakest track,
- consistency help,
- consistency blocker,
- next week priority.

The artifact title is generated from the week range and is not independently
edited. Date equals `weekEnd`. Changes update the existing review artifact
rather than creating duplicates.

## 7. Monthly Missions

### 7.1 Seed Data

Seed version 2 inserts missions for June through December 2026 using the PRD
titles, themes, and deliverables. Stable IDs equal their `YYYY-MM` month keys.
Initialization adds only missing months and never overwrites edited missions or
checklist state.

Metadata `seedVersion` updates to 2 only after the seed transaction succeeds.
Schema version remains 1.

### 7.2 Mission Workflow

The Missions route presents all seven months in chronological order and
emphasizes the configured current month. The detail route supports:

- title, theme, and description editing,
- checklist item creation, editing, ordering, completion, and removal,
- notes,
- linked target artifacts,
- derived progress,
- explicit mission completion.

Checklist completion sets `completedAt` to the current instant; reopening an
item removes it. Empty checklist progress is zero unless the mission is
explicitly completed, matching the SDD.

Mission completion does not require every checklist item, but incomplete items
are summarized in the confirmation dialog. Reopening a mission is supported.

### 7.3 Monthly Review

Each mission may link one `monthly_review` artifact with details keyed by month.
The user can open a generic monthly review form from the mission detail page.
Only one non-archived monthly review is permitted per month. Saving and linking
the review to its mission occurs in one transaction.

Monthly review fields are:

- major progress,
- unfinished work,
- strongest project,
- weakest project,
- best artifact,
- main lesson,
- next month focus.

The review remains generic enough for Phase 2 and can gain specialized details
through a future migration without changing mission ownership.

## 8. Calendar

### 8.1 Month Projection

The Calendar route defaults to the month containing today and supports month
navigation within the challenge's calendar span. It queries only the visible
month plus adjacent grid dates.

Each day cell displays:

- local date number,
- active, missed, future, or out-of-range state,
- total awarded points,
- up to three project color indicators,
- current-day treatment.

A missed day is an elapsed in-range date without a qualifying activity. Future
dates and dates outside the challenge are neutral and are not labeled missed.
Streak breaks are represented by the transition from an active day to an
elapsed missed day; no separate durable record is created.

### 8.2 Filtering and Day Details

Project filtering changes qualification, indicators, and point totals to the
selected project. The unfiltered view uses standard no-zero qualification.

Selecting a date opens an accessible day-detail dialog containing all
activities for the day, project names, action levels, points, notes, linked
artifacts, and edit actions. The dialog also provides add-activity with the
selected date prefilled.

## 9. Persistence and Transactions

Repositories are added for artifacts and missions. Application services provide
atomic operations for:

- artifact creation with optional activity,
- artifact/activity reciprocal link updates,
- artifact cleanup across activities and missions,
- checklist updates,
- monthly review creation and mission linking,
- weekly review uniqueness enforcement.

Uniqueness for reviews is enforced in services by deterministic detail keys
inside a write transaction because the generic artifact table has no dedicated
week or month index. Transaction tests inject failures after intermediate writes
and verify complete rollback.

## 10. Backup Behavior

The Phase 1 full backup envelope already contains artifacts and missions.
Phase 2 adds tests proving:

- seeded and edited missions export,
- artifact details and unknown keys survive serialization,
- reciprocal links remain intact,
- weekly and monthly review details export without loss.

Import remains deferred.

## 11. Accessibility and Responsive Behavior

All new primary routes target WCAG 2.2 AA:

- calendar cells are buttons with complete textual accessible names,
- calendar status never relies on color alone,
- month and week navigation exposes the selected period,
- dialogs trap and restore focus,
- checklist controls have explicit labels and completion state,
- filters are keyboard operable,
- review summary values have textual equivalents,
- mobile fixed navigation does not obscure dialogs or page actions.

## 12. Error and Empty States

- No artifacts: explain evidence collection and offer create action.
- No activities in a calendar day: show empty day detail with add action.
- Missing mission: show not-found state without creating a record.
- Duplicate review conflict: load the existing review instead of overwriting it.
- Relationship transaction failure: preserve all prior links and form input.
- Invalid external URL: field error, no write.
- Seed failure: retain prior metadata seed version and permit retry.
- Archived linked records: show their title and archived status rather than
  silently dropping historical context.

## 13. Testing

### 13.1 Unit and Selectors

Cover month grids, missed/future states, project filtering, point aggregation,
weekly summaries, best/weakest project tie-breaking, mission progress, review
completion eligibility, and review uniqueness keys.

### 13.2 Repositories and Services

Use fake IndexedDB to cover seed-v2 idempotency, artifact CRUD and filtering,
atomic reciprocal links, cleanup, mission checklist mutations, review
uniqueness, and rollback on injected failures.

### 13.3 Components

Cover generic artifact validation, unsaved-state handling, artifact filters,
weekly draft/completion behavior, mission checklist editing, month navigation,
calendar day dialogs, loading, empty, archived, and failure states.

### 13.4 Browser

Playwright verifies:

1. create, edit, archive, restore, and filter a generic artifact,
2. create an artifact plus linked activity atomically,
3. save a current-week draft and block early completion,
4. complete and edit a previous-week review,
5. update mission checklists and observe progress,
6. create and link a monthly review,
7. inspect active and missed calendar days,
8. filter the calendar by project and add an activity for a selected day,
9. export Phase 2 records in a full backup,
10. perform critical artifact and mission flows offline.

Axe runs on every Phase 2 primary route in desktop and mobile projects.

## 14. Delivery Order

Implementation proceeds as integrated vertical slices:

1. Domain schemas, selectors, repositories, and seed-v2 mission data.
2. Generic artifact CRUD, relationships, filters, and backup coverage.
3. Weekly review summaries, current-week drafts, and completion rules.
4. Mission timeline, checklist management, notes, and monthly reviews.
5. Calendar projection, filtering, day details, and dated quick add.
6. Navigation, responsive polish, offline flows, axe, and production browser
   verification.

Each slice must pass its focused tests and the existing Phase 1 regression suite
before the next slice expands behavior.

## 15. Exit Criteria

Phase 2 is complete only when:

1. generic artifacts can be managed and linked without relationship drift,
2. current-week reviews save as drafts and cannot complete before week end,
3. previous weeks can be completed and reviewed from derived records,
4. all seven missions seed idempotently and preserve customization,
5. checklist and mission progress update immediately,
6. monthly reviews link atomically to their missions,
7. calendar status and project filters match bounded activity queries,
8. Phase 2 records appear intact in full backups,
9. all new critical flows work in the production build offline,
10. desktop and mobile routes pass automated accessibility checks,
11. all Phase 1 tests continue to pass.
