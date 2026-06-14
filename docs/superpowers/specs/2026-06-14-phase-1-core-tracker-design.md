# No Zero Phase 1 Core Tracker Design

## 1. Purpose

This specification defines the first implementation milestone for No Zero. It
narrows `docs/SDD.md` to a deployable core tracker while preserving the SDD's
technology choices, data contracts, and future feature boundaries.

Phase 1 succeeds when the user can initialize the application, log and manage a
daily activity offline, reload without losing data, inspect project progress,
and export a complete JSON backup. All streak, score, and weekly target results
must be derived from durable records and covered by automated tests.

## 2. Scope

### 2.1 Included

- React and TypeScript application scaffold built with Vite.
- React Router application shell and route-level error handling.
- Tailwind CSS styling, Radix UI primitives, and Lucide React icons.
- Responsive desktop sidebar and mobile bottom navigation.
- Dexie database, schema version 1, repositories, initialization, and seed data.
- App settings and database metadata initialization.
- Today route with no-zero status, streaks, quick add, suggestions, daily logs,
  weekly points, and target gaps.
- Projects route with active and archived track lists.
- Project detail route with track configuration, progress, totals, and activity
  history.
- Activity create, edit, and delete workflows.
- Pure domain calculations for dates, streaks, points, weekly status, and target
  progress.
- Full versioned JSON backup export.
- Installable PWA shell and offline static asset access.
- Automated unit, repository, component, accessibility, and critical browser
  tests for Phase 1.

### 2.2 Deferred

Calendar, reviews, monthly missions, artifact authoring, Vinance feature/task
management, search, insights, import, selective and Markdown export, reminders,
storage reporting, reset, and specialized track forms remain in later SDD
phases. Their durable tables may exist in schema version 1, but Phase 1 does not
write partial feature records to them.

## 3. Architecture

The implementation uses workflow-oriented features over shared domain and
storage layers:

```text
src/
  app/                  shell, router, providers, errors
  components/           project-owned reusable UI
  db/                   Dexie schema, repositories, initialization
  domain/               entities, schemas, dates, selectors
  features/
    activities/         create, edit, delete forms and services
    projects/           project list, detail, and configuration
    settings/           Phase 1 backup export
    today/              daily dashboard and quick-add workflow
  pwa/                  install, offline, and update integration
  seed/                 versioned default records
  test/                 test database and builders
```

UI components never call Dexie directly. Query hooks consume repository
interfaces and Dexie live queries. Application services validate inputs and
coordinate writes. Domain calculations remain pure TypeScript without React or
Dexie dependencies.

## 4. Routes and Navigation

Phase 1 implements:

| Route | Behavior |
| --- | --- |
| `/` | Today dashboard |
| `/projects` | Active and archived project tracks |
| `/projects/:trackId` | Track details, configuration, and activity history |
| `/settings` | Backup export and application/database version information |
| `*` | Accessible not-found screen |

Desktop navigation shows Today, Projects, and Settings in a persistent sidebar.
Mobile navigation shows Today and Projects in the bottom bar, with Settings in
an overflow menu. Deferred routes are not displayed as inactive placeholders.

The shell includes a global add-activity action, offline status, update status,
toast region, accessible live announcements, and route error isolation.

## 5. Persistence and Initialization

### 5.1 Database

Dexie schema version 1 declares all SDD tables:

- `tracks`
- `activities`
- `artifacts`
- `missions`
- `vinanceFeatures`
- `vinanceTasks`
- `settings`
- `metadata`

Only tracks, activities, settings, and metadata are used by Phase 1. Indexes
match section 5.1 of the SDD.

### 5.2 Initialization

Initialization runs once behind an application bootstrap state:

1. Open IndexedDB.
2. In one transaction, insert missing default tracks using stable slug IDs.
3. Insert settings when absent. The challenge starts on the current date in the
   detected IANA time zone and ends on `2026-12-31`.
4. Insert database metadata with schema and seed version 1.
5. Render the application after the transaction commits.

Initialization is idempotent. Existing user-modified records are never replaced
when seed version 1 runs again.

### 5.3 Default Tracks

The seed contains the six canonical tracks from PRD section 14.1: English,
Korean, Vinance, Devlog, Taste-Building, and Conversation. Each counts toward
no-zero status. Marathon Reflection is optional in the PRD, so it is not
silently enabled or seeded in Phase 1; its setup belongs to the later
specialized workflow. Values follow the PRD:

| ID | Points | Weekly target |
| --- | ---: | ---: |
| `english` | 2 | 5 |
| `korean` | 1 | 3 |
| `vinance` | 3 | 5 |
| `devlog` | 2 | 2 |
| `taste` | 1 | 2 |
| `conversation` | 1 | 2 |

Each seed record uses the PRD's exact minimum, normal, and strong action text,
plus a stable slug, icon, color, and sort order.

## 6. Domain Behavior

### 6.1 Local Dates

`LocalDate` values use `YYYY-MM-DD` in the configured IANA time zone. Date
utilities validate real calendar dates and use calendar arithmetic rather than
elapsed-hour arithmetic. Week boundaries honor the settings value
`weekStartsOn`, defaulting to Monday.

### 6.2 Activity Rules

Quick add requires track, level, and title. It defaults to:

- today's configured local date,
- `minimum` level,
- the selected track's default points,
- zero bonus points,
- no duration, note, tags, or artifact links.

Expanded fields support date, duration, note, points, bonus points, and tags.
Points and bonus points must be non-negative integers. Duration, when supplied,
must be a positive integer. Tags are trimmed, empty values are removed, and
duplicates are compared case-insensitively.

Editing preserves the activity ID and `createdAt`, updates `updatedAt`, and does
not silently replace historical points when track defaults change. Delete uses
a focused confirmation dialog. Failed writes keep form input available.

### 6.3 Derived Results

Selectors implement the SDD rules for:

- today's active status,
- current streak with the incomplete-current-day grace rule,
- longest streak,
- last completed day,
- weekly point total,
- weekly status using default thresholds 15, 22, and 28,
- per-track weekly session count and remaining target,
- total track sessions and points.

Archived tracks remain visible in history and calculations but are excluded
from quick add, suggestions, and current missing-target prompts.

## 7. User Experience

### 7.1 Today

The page order is:

1. Current date, no-zero status, current streak, and longest streak.
2. Quick-add activity control.
3. Low-energy minimum-action suggestions from active tracks.
4. Today's activity list with edit and delete actions.
5. Weekly score and status.
6. Per-track target progress and missing-target summary.

The compact quick-add form exposes track, action level, and title. Choosing a
suggestion preselects its track, minimum level, and minimum-action title.
Additional fields are disclosed without navigating away. A successful save
closes or resets the form, moves focus to a stable location, and announces the
result.

### 7.2 Projects

The list presents active tracks in seed/user sort order and archived tracks in a
separate collapsed section. Each active track shows weekly progress, total
sessions, and total points.

The detail route shows description, end-of-year goal, three action descriptions,
weekly target progress, totals, and reverse-chronological activity history. An
edit dialog supports all mutable Track fields except ID and slug. Archiving
requires confirmation; restoring an archived track is immediate after explicit
action.

### 7.3 Settings

Phase 1 Settings shows application version, database schema version, seed
version, challenge dates, locale, and time zone. The backup action downloads a
full `no-zero-backup` JSON envelope matching the SDD export contract. Export
reads a consistent database snapshot and updates `lastBackupAt` only after the
file is successfully prepared for download.

## 8. Styling and Accessibility

The visual system follows a restrained, work-focused layout. Tailwind tokens
define semantic colors, spacing, typography, radii, shadows, and focus rings.
Radix primitives provide dialogs, dropdowns, collapsible sections, and toasts.
Lucide icons always have visible labels or accessible names where needed.

The interface targets WCAG 2.2 AA:

- all workflows are keyboard operable,
- controls have visible labels,
- status is communicated with text and iconography as well as color,
- dialogs trap and restore focus,
- validation errors associate with their fields,
- touch targets are at least 44 by 44 CSS pixels where practical,
- motion respects `prefers-reduced-motion`,
- mobile content is not obscured by bottom navigation.

## 9. PWA and Failure States

The Vite PWA integration precaches versioned application assets and serves the
SPA shell for navigation while offline. User records remain only in IndexedDB.
The manifest includes standalone display, theme colors, start URL, and regular
and maskable icons.

An update prompt appears when a worker is ready. Phase 1 quick-add and edit
forms expose dirty state; updates do not force a reload while a form is dirty.

Required blocking and recoverable states include:

- IndexedDB unavailable: blocking compatibility screen.
- Initialization failure: retry action without reporting success.
- Validation failure: field errors and preserved input.
- Transaction or quota failure: preserved input, retry, and backup guidance.
- Service worker failure: online SPA remains usable with offline limitation.
- Route render failure: route-local fallback while durable data remains intact.

## 10. Testing

### 10.1 Unit

Vitest covers local-date validation, time-zone conversion, Monday/Sunday week
boundaries, challenge clamping, current and longest streaks, point thresholds,
weekly targets, track totals, tag normalization, and backup envelope creation.
Fixtures include leap day, year transition, DST zones, future challenge start,
and activity edits/deletes.

### 10.2 Repository and Services

Fake IndexedDB tests cover schema indexes, idempotent seed initialization,
activity CRUD, live-query-compatible writes, historical point preservation,
track archive behavior, consistent export snapshots, and transaction rollback
after injected failures.

### 10.3 Components

Testing Library and axe cover quick add defaults and expanded fields, suggestion
prefill, edit/delete recalculation, project configuration, loading and empty
states, errors, keyboard behavior, and accessible dialogs.

### 10.4 Browser

Playwright verifies:

1. first initialization and seeded tracks,
2. minimum activity creation and immediate non-zero status,
3. edit and delete recalculation,
4. persistence after reload,
5. project customization and archive/restore,
6. full JSON export,
7. production build reload and activity CRUD while offline,
8. responsive mobile and desktop navigation,
9. keyboard operation of the core flow,
10. automated axe checks on all Phase 1 routes.

## 11. Delivery Order

Implementation proceeds as vertical slices:

1. Toolchain, shell, visual tokens, and test harness.
2. Domain contracts, date utilities, and selectors.
3. Database schema, repositories, initialization, and seed records.
4. Today read model and quick-add creation.
5. Activity edit/delete and error states.
6. Projects list, detail, configuration, and archive/restore.
7. Backup export and Settings information.
8. PWA behavior, responsive polish, accessibility, and complete browser tests.

Each slice must compile and pass its relevant automated tests before the next
slice expands the behavioral surface.

## 12. Exit Criteria

Phase 1 is complete only when:

1. a user can log, edit, and delete an activity in the production build,
2. the activity survives reload and offline use,
3. Today and Projects update from durable data without manual refresh,
4. streak, points, weekly status, and target selectors pass boundary tests,
5. seed initialization is idempotent and preserves customization,
6. a full valid backup can be downloaded,
7. core routes pass automated accessibility checks,
8. mobile and desktop critical flows pass Playwright,
9. no deferred feature writes incomplete records,
10. the static production bundle supports a configurable base path.
