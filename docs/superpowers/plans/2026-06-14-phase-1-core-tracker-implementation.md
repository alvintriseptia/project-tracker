# No Zero Phase 1 Core Tracker Implementation Plan

**Design:** `docs/superpowers/specs/2026-06-14-phase-1-core-tracker-design.md`

**Goal:** Deliver the SDD Phase 1 local-first tracker with durable activity CRUD,
derived streak and weekly metrics, project configuration, backup export, and an
offline-capable responsive shell.

## Task 1: Scaffold the application and quality gates

**Create:**

- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `index.html`
- `src/main.tsx`
- `src/styles.css`
- `src/vite-env.d.ts`
- `eslint.config.js`
- `vitest.setup.ts`
- `playwright.config.ts`
- `.gitignore`

**Steps:**

1. Create a Vite React TypeScript application using Bun.
2. Install React Router, Tailwind v4 and its Vite plugin, Radix UI primitives,
   Lucide, Dexie, Zod, React Hook Form, date-fns, Vite PWA, Vitest, Testing
   Library, fake-indexeddb, Playwright, and axe dependencies.
3. Configure Tailwind, Vitest with jsdom, Playwright, TypeScript strict mode,
   ESLint, production base path, and package scripts.
4. Add a minimal application entry and semantic global design tokens.
5. Verify `bun run typecheck`, `bun run lint`, `bun test`, and `bun run build`.

## Task 2: Implement domain contracts and validation

**Create:**

- `src/domain/types.ts`
- `src/domain/schemas.ts`
- `src/domain/tags.ts`
- `src/domain/backup.ts`
- `src/domain/__tests__/schemas.test.ts`
- `src/domain/__tests__/tags.test.ts`

**Steps:**

1. Define SDD entities for all schema-v1 tables and the backup envelope.
2. Define Zod schemas for local dates, instants, tracks, activities, settings,
   metadata, and deferred table records.
3. Implement normalized case-insensitive tag handling.
4. Add valid, invalid, and boundary tests.
5. Verify the domain test suite and TypeScript.

## Task 3: Implement local-date and analytics selectors

**Create:**

- `src/domain/dates.ts`
- `src/domain/selectors.ts`
- `src/domain/__tests__/dates.test.ts`
- `src/domain/__tests__/selectors.test.ts`

**Steps:**

1. Implement configured-time-zone local date conversion and validation.
2. Implement calendar arithmetic, challenge clamping, and configurable week
   boundaries.
3. Implement qualifying active dates, current/longest streak, last completed
   date, weekly status, target progress, and track totals.
4. Cover leap day, year rollover, DST zones, incomplete-current-day grace,
   archived tracks, future challenge start, edits, and deletes.
5. Verify focused unit tests and the full quality gate.

## Task 4: Implement Dexie schema, seed data, and repositories

**Create:**

- `src/db/database.ts`
- `src/db/repositories.ts`
- `src/db/initialize.ts`
- `src/db/errors.ts`
- `src/seed/tracks.ts`
- `src/db/__tests__/database.test.ts`
- `src/db/__tests__/repositories.test.ts`
- `src/test/database.ts`
- `src/test/builders.ts`

**Steps:**

1. Declare schema version 1 with all SDD tables and indexes.
2. Seed the six canonical PRD tracks, settings, and metadata atomically.
3. Expose repository interfaces and Dexie implementations for tracks,
   activities, settings, metadata, and full snapshot export.
4. Implement idempotent initialization that preserves user customization.
5. Test indexed CRUD, archive behavior, snapshot consistency, and rollback.
6. Verify repository tests and the full quality gate.

## Task 5: Build the application shell

**Create:**

- `src/app/App.tsx`
- `src/app/router.tsx`
- `src/app/AppProviders.tsx`
- `src/app/AppShell.tsx`
- `src/app/AppErrorBoundary.tsx`
- `src/app/BootstrapScreen.tsx`
- `src/app/NotFoundPage.tsx`
- `src/app/useAppBootstrap.ts`
- `src/components/Button.tsx`
- `src/components/Card.tsx`
- `src/components/EmptyState.tsx`
- `src/components/StatusBadge.tsx`
- `src/components/ToastProvider.tsx`
- `src/components/VisuallyHidden.tsx`
- `src/app/__tests__/AppShell.test.tsx`

**Steps:**

1. Add bootstrap loading, retry, and IndexedDB compatibility states.
2. Add desktop sidebar, mobile bottom navigation, overflow settings access,
   route outlet, global add action, and live regions.
3. Add route error and not-found screens.
4. Add reusable project primitives based on Radix where behavior requires it.
5. Test responsive navigation semantics and keyboard-accessible shell behavior.
6. Verify component tests and build.

## Task 6: Implement activity services and forms

**Create:**

- `src/features/activities/activityService.ts`
- `src/features/activities/activityFormSchema.ts`
- `src/features/activities/ActivityForm.tsx`
- `src/features/activities/ActivityDialog.tsx`
- `src/features/activities/DeleteActivityDialog.tsx`
- `src/features/activities/__tests__/activityService.test.ts`
- `src/features/activities/__tests__/ActivityForm.test.tsx`

**Steps:**

1. Validate and normalize create/update inputs with Zod.
2. Preserve IDs, creation timestamps, and historical awarded points on edit.
3. Build compact and expanded React Hook Form modes.
4. Add suggestion prefill, dirty-form tracking, persistence errors, focus
   restoration, and success announcements.
5. Add confirmed deletion and preserve linked artifacts.
6. Test defaults, expanded fields, validation, failures, edit, and deletion.
7. Verify focused tests and the full quality gate.

## Task 7: Implement Today as the first complete vertical slice

**Create:**

- `src/features/today/useTodayData.ts`
- `src/features/today/TodayPage.tsx`
- `src/features/today/TodayHeader.tsx`
- `src/features/today/MinimumSuggestions.tsx`
- `src/features/today/TodayActivityList.tsx`
- `src/features/today/WeeklyProgress.tsx`
- `src/features/today/__tests__/TodayPage.test.tsx`

**Steps:**

1. Subscribe to settings, active tracks, today's activities, and current-week
   activities using bounded Dexie live queries.
2. Derive streak and weekly values through pure selectors.
3. Render the approved Today content order and empty/loading/error states.
4. Connect quick add, suggestion prefill, edit, and delete workflows.
5. Verify immediate recalculation and accessible announcements in tests.
6. Run all unit and component gates.

## Task 8: Implement Projects

**Create:**

- `src/features/projects/useProjectsData.ts`
- `src/features/projects/ProjectsPage.tsx`
- `src/features/projects/ProjectDetailPage.tsx`
- `src/features/projects/TrackForm.tsx`
- `src/features/projects/TrackEditDialog.tsx`
- `src/features/projects/TrackArchiveDialog.tsx`
- `src/features/projects/__tests__/ProjectsPage.test.tsx`
- `src/features/projects/__tests__/ProjectDetailPage.test.tsx`

**Steps:**

1. Query tracks and bounded activity histories through repositories.
2. Render active and collapsed archived sections with totals and progress.
3. Render project detail, actions, goals, metrics, and history.
4. Validate mutable track settings while keeping ID and slug immutable.
5. Add confirmed archive and explicit restore.
6. Test customization persistence, progress, archive, restore, and missing IDs.
7. Run all quality gates.

## Task 9: Implement Settings and full backup export

**Create:**

- `src/features/settings/exportService.ts`
- `src/features/settings/SettingsPage.tsx`
- `src/features/settings/__tests__/exportService.test.ts`
- `src/features/settings/__tests__/SettingsPage.test.tsx`

**Steps:**

1. Read all schema-v1 tables in one consistent transaction.
2. Validate and serialize the SDD `no-zero-backup` envelope.
3. Trigger a JSON download and update `lastBackupAt` only after preparation.
4. Display app, schema, seed, challenge, locale, and time-zone information.
5. Test envelope shape, empty deferred tables, download behavior, and failures.
6. Run all quality gates.

## Task 10: Add PWA behavior and production assets

**Create:**

- `src/pwa/OfflineStatus.tsx`
- `src/pwa/ReloadPrompt.tsx`
- `src/pwa/useDirtyForms.ts`
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/icon-maskable-512.png`
- `public/favicon.svg`
- `src/pwa/__tests__/ReloadPrompt.test.tsx`

**Modify:**

- `vite.config.ts`
- `src/app/AppProviders.tsx`
- `src/app/AppShell.tsx`

**Steps:**

1. Configure Vite PWA manifest, Workbox app-shell fallback, and generated
   service-worker registration.
2. Add online/offline state and a worker update prompt.
3. Defer update reload while registered forms are dirty.
4. Generate regular and maskable application icons.
5. Verify manifest and service-worker output in the production build.

## Task 11: Add browser and accessibility verification

**Create:**

- `e2e/core-tracker.spec.ts`
- `e2e/accessibility.spec.ts`

**Steps:**

1. Test initialization, CRUD, recalculation, and reload persistence.
2. Test project customization, archive, restore, and JSON download.
3. Test production offline reload and activity CRUD.
4. Test mobile and desktop navigation without overlap.
5. Test the critical keyboard path.
6. Run axe on every Phase 1 route.
7. Run Playwright against the production preview.

## Task 12: Final hardening and documentation

**Create:**

- `README.md`

**Modify as needed:**

- Phase 1 implementation files
- `docs/SDD.md` only if implementation reveals a factual contradiction

**Steps:**

1. Document setup, scripts, architecture, local data behavior, build base path,
   and browser-test prerequisites.
2. Run `bun run lint`.
3. Run `bun run typecheck`.
4. Run `bun test`.
5. Run `bun run build`.
6. Run `bun run test:e2e`.
7. Inspect the final diff for unintended files or deferred feature behavior.
8. Commit the completed Phase 1 implementation in coherent increments.
