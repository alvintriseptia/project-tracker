# No Zero Phase 2 Reviews and Missions Implementation Plan

**Design:** `docs/superpowers/specs/2026-06-14-phase-2-reviews-missions-design.md`

**Goal:** Add generic artifacts, weekly reviews, monthly missions, and calendar
workflows while preserving Phase 1 behavior, offline operation, and atomic
relationship integrity.

## Task 1: Extend domain contracts and schemas

**Modify:**

- `src/domain/types.ts`
- `src/domain/schemas.ts`
- `src/domain/backup.ts`

**Create:**

- `src/domain/reviews.ts`
- `src/domain/missions.ts`
- `src/domain/calendar.ts`
- `src/domain/__tests__/artifacts.test.ts`
- `src/domain/__tests__/reviews.test.ts`
- `src/domain/__tests__/missions.test.ts`
- `src/domain/__tests__/calendar.test.ts`

**Steps:**

1. Define discriminated details for weekly and monthly reviews.
2. Add strict artifact, mission, checklist, external-link, and review schemas.
3. Implement mission progress and checklist state helpers.
4. Implement weekly summary and completion-eligibility selectors.
5. Implement bounded month-grid and day-status projection.
6. Test leap months, challenge boundaries, future days, filtering, review
   uniqueness keys, and tie-breaking.
7. Run lint, typecheck, and unit tests.

## Task 2: Add mission seed version 2

**Create:**

- `src/seed/missions.ts`
- `src/db/__tests__/missionSeed.test.ts`

**Modify:**

- `src/db/database.ts`
- `src/db/initialize.ts`

**Steps:**

1. Define stable June through December 2026 mission records from the PRD.
2. Add missing missions atomically without overwriting edits.
3. Update metadata seed version only after successful seeding.
4. Verify repeated initialization, partial pre-existing data, customization
   preservation, and rollback.
5. Run all Phase 1 tests.

## Task 3: Implement artifact and mission repositories

**Modify:**

- `src/db/repositories.ts`

**Create:**

- `src/db/relationships.ts`
- `src/db/__tests__/artifactRepository.test.ts`
- `src/db/__tests__/missionRepository.test.ts`
- `src/db/__tests__/relationships.test.ts`

**Steps:**

1. Add bounded artifact queries and indexed filters.
2. Add mission list/get/put operations.
3. Add atomic artifact creation with optional activity.
4. Add reciprocal activity link replacement.
5. Add artifact cleanup across activities and missions.
6. Add weekly/monthly review uniqueness lookup inside transactions.
7. Inject intermediate failures and verify complete rollback.

## Task 4: Implement generic artifact services and editor

**Create:**

- `src/features/artifacts/artifactFormSchema.ts`
- `src/features/artifacts/artifactService.ts`
- `src/features/artifacts/ArtifactForm.tsx`
- `src/features/artifacts/ArtifactEditorPage.tsx`
- `src/features/artifacts/ArtifactArchiveDialog.tsx`
- `src/features/artifacts/__tests__/artifactService.test.ts`
- `src/features/artifacts/__tests__/ArtifactForm.test.tsx`

**Steps:**

1. Build validated create/edit/archive/restore services.
2. Support optional project, tags, escaped plain text, and HTTP(S) links.
3. Support existing activity links and explicit activity creation.
4. Preserve form state after errors and warn on unsaved navigation.
5. Ensure publishing/completion never creates implicit activity.
6. Test validation, reciprocal links, historical fields, and failure states.

## Task 5: Implement artifact collection and detail

**Create:**

- `src/features/artifacts/useArtifactsData.ts`
- `src/features/artifacts/ArtifactsPage.tsx`
- `src/features/artifacts/ArtifactDetailPage.tsx`
- `src/features/artifacts/ArtifactFilters.tsx`
- `src/features/artifacts/__tests__/ArtifactsPage.test.tsx`

**Modify:**

- `src/app/router.tsx`
- `src/app/AppShell.tsx`

**Steps:**

1. Add artifact routes and responsive navigation.
2. Add indexed narrowing plus normalized text matching.
3. Add type, status, project, date, and archived filters.
4. Render safe external links and escaped content.
5. Add archive/restore and linked-record context.
6. Verify empty, loading, filter, archive, and mobile states.

## Task 6: Implement weekly review workflow

**Create:**

- `src/features/reviews/weeklyReviewSchema.ts`
- `src/features/reviews/weeklyReviewService.ts`
- `src/features/reviews/useWeeklyReviewData.ts`
- `src/features/reviews/WeeklyReviewPage.tsx`
- `src/features/reviews/WeeklyReviewForm.tsx`
- `src/features/reviews/__tests__/weeklyReviewService.test.ts`
- `src/features/reviews/__tests__/WeeklyReviewPage.test.tsx`

**Modify:**

- `src/app/router.tsx`
- `src/app/AppShell.tsx`

**Steps:**

1. Add bounded week navigation within the challenge.
2. Derive score, status, active days, project sessions, missing targets,
   artifacts, and strongest/weakest project.
3. Save one deterministic weekly review artifact per week.
4. Allow current-week drafts and block completion until the week ends.
5. Keep completed historical reviews editable.
6. Test draft/completion transitions, duplicates, ties, and time-zone boundary.

## Task 7: Implement mission timeline and detail

**Create:**

- `src/features/missions/missionService.ts`
- `src/features/missions/useMissionsData.ts`
- `src/features/missions/MissionsPage.tsx`
- `src/features/missions/MissionDetailPage.tsx`
- `src/features/missions/MissionEditDialog.tsx`
- `src/features/missions/MissionChecklist.tsx`
- `src/features/missions/MissionCompletionDialog.tsx`
- `src/features/missions/__tests__/missionService.test.ts`
- `src/features/missions/__tests__/MissionDetailPage.test.tsx`

**Modify:**

- `src/app/router.tsx`
- `src/app/AppShell.tsx`

**Steps:**

1. Render the seven chronological missions with current-month emphasis.
2. Add mission text editing and checklist CRUD/reordering.
3. Set and clear checklist completion instants.
4. Link target artifacts and derive progress.
5. Add explicit completion/reopening with unfinished-item confirmation.
6. Test offline live updates, archived links, and transaction failures.

## Task 8: Implement monthly reviews

**Create:**

- `src/features/missions/monthlyReviewSchema.ts`
- `src/features/missions/MonthlyReviewForm.tsx`
- `src/features/missions/__tests__/MonthlyReviewForm.test.tsx`

**Modify:**

- `src/features/missions/missionService.ts`
- `src/features/missions/MissionDetailPage.tsx`

**Steps:**

1. Create or update one monthly review artifact per mission month.
2. Save review and mission link atomically.
3. Support project and artifact references.
4. Preserve archived review context and prevent duplicates.
5. Test rollback and exported detail preservation.

## Task 9: Implement calendar

**Create:**

- `src/features/calendar/useCalendarData.ts`
- `src/features/calendar/CalendarPage.tsx`
- `src/features/calendar/CalendarGrid.tsx`
- `src/features/calendar/CalendarDayDialog.tsx`
- `src/features/calendar/__tests__/CalendarPage.test.tsx`

**Modify:**

- `src/features/activities/ActivityDialog.tsx`
- `src/features/activities/ActivityComposerProvider.tsx`
- `src/app/router.tsx`
- `src/app/AppShell.tsx`

**Steps:**

1. Query the visible month and adjacent grid dates only.
2. Render active, missed, future, out-of-range, and today states.
3. Show awarded points and up to three track indicators.
4. Filter qualification and totals by project.
5. Add day-detail activities, linked artifacts, edit actions, and dated add.
6. Verify month navigation, challenge boundaries, and keyboard operation.

## Task 10: Extend backup and offline coverage

**Modify:**

- `src/features/settings/__tests__/exportService.test.ts`
- `e2e/core-tracker.spec.ts`

**Create:**

- `e2e/reviews-missions.spec.ts`

**Steps:**

1. Verify artifacts, missions, unknown detail keys, and reciprocal links export.
2. Test generic artifact CRUD and linked activity.
3. Test current-week review draft and prior-week completion.
4. Test checklist progress and monthly review links.
5. Test calendar states, filtering, and dated add.
6. Test critical artifact and mission flows offline.

## Task 11: Accessibility, performance, and hardening

**Modify:**

- `e2e/accessibility.spec.ts`
- `README.md`
- feature files as required by findings

**Steps:**

1. Run axe on every Phase 2 primary route in desktop and mobile projects.
2. Verify complete accessible names for calendar cells and checklist controls.
3. Verify dialogs restore focus and mobile navigation does not obscure actions.
4. Confirm calendar projection remains bounded and under the SDD target.
5. Document Phase 2 workflows and storage behavior.
6. Run lint, typecheck, unit tests, production build, base-path build, all
   Playwright tests, and diff checks.
7. Commit Phase 2 implementation without modifying the pre-existing untracked
   PRD or SDD.
