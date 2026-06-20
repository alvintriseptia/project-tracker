# Product Requirements Document: No Zero — Semester Challenge Tracker PWA

## 1. Product Overview

### 1.1 Product Name

**No Zero**

Working subtitle:

**Semester Challenge Tracker**

### 1.2 Product Type

A local-first Progressive Web App used to track, manage, and review the user’s personal semester challenge from June 2026 until 31 December 2026.

### 1.3 Product Mission

No Zero helps the user maintain daily consistency across several personal development projects by turning them into a structured challenge system with daily actions, streaks, points, weekly reviews, monthly missions, notes, project tracking, and reflection artifacts.

The product is designed around one central rule:

> The user should not have a zero day.

A day is considered non-zero when the user completes at least one meaningful action from any active project track.

### 1.4 Background

The user is currently building a long-term personal development curriculum until the end of 2026. The chosen tracks are:

1. English practice
2. Korean as fun learning
3. Build personal product: Vinance
4. Writing devlogs
5. Taste-building project
6. Conversational skill project

The user also has an ongoing virgin marathon training journey for 25 October 2026. Marathon training is not the main purpose of this app, but the app must allow optional tracking and reflection related to marathon discipline when relevant to the semester challenge.

### 1.5 Core Product Promise

No Zero gives the user a single daily control center to answer:

1. Did I do something meaningful today?
2. What project did I move forward?
3. Am I maintaining consistency?
4. Am I producing weekly artifacts?
5. Am I progressing toward my end-of-year goals?
6. What should I do next when I only have a small amount of energy?

---

## 2. Product Goals

### 2.1 Primary Goals

The product must help the user:

1. Maintain a no-zero-day streak until the end of 2026.
2. Track daily actions across all selected project tracks.
3. Build consistency without relying on motivation.
4. Convert daily effort into visible progress.
5. Produce weekly and monthly artifacts.
6. Review progress through dashboards and reflections.
7. Support low-energy days through minimum viable actions.
8. Keep all data local and available offline.
9. Avoid cost by using local browser storage.
10. Provide export and import so data is not trapped.

### 2.2 End-of-Year Outcome Goals

By 31 December 2026, the product should help the user reach or track these outcomes:

#### English Practice

* 100+ English speaking, writing, or reflection reps.
* Ability to explain technical projects, personal goals, and life reflections more clearly in English.

#### Korean Fun Learning

* 50+ Korean learning sessions.
* Korean remains enjoyable and consistent without becoming pressure-heavy.

#### Vinance

* Regular progress on the Vinance product.
* Trackable development sessions, tasks, milestones, and devlog links.
* Finance module progress can be documented inside the app.

#### Devlogs

* 20+ devlogs or weekly progress notes written.
* Devlogs can be drafted, linked, tagged, and reviewed.

#### Taste-Building

* 20+ taste notes across food, places, products, design, storytelling, or lifestyle.
* Each taste note captures observation, judgment, and something the user can “steal” for personal life or product thinking.

#### Conversational Skill

* 20+ intentional conversation reps.
* Each conversation can store questions asked, insights heard, reflection, and follow-up actions.

#### Discipline

* Maintain strong no-zero-day behavior.
* Build a visible record of consistency.

---

## 3. Product Principles

### 3.1 No Zero Day

The product must make the no-zero-day rule central.

A valid non-zero day can be achieved by completing at least one meaningful action from any project track.

Examples:

* Speak English for 3 minutes.
* Review 5 Korean words.
* Work on Vinance for 10 minutes.
* Write 2 devlog bullets.
* Capture 1 taste observation.
* Ask 1 intentional question.
* Write 1 short reflection.

### 3.2 Minimum Action First

Each project must have a minimum action so the user can still win on low-energy days.

The app must support three activity levels:

1. Minimum
2. Normal
3. Strong

### 3.3 Evidence Over Intention

The app tracks completed actions, notes, outputs, and reviews. It should not only store plans.

Every week should ideally produce at least one artifact, such as:

* Devlog
* Taste note
* Conversation reflection
* Vinance feature/task progress
* English recording note
* Korean vocabulary note
* Weekly review

### 3.4 Local-First and Private

The app must work without a backend.

User data must remain local unless the user explicitly exports it.

### 3.5 Fast Daily Usage

The user should be able to complete a daily check-in in under 30 seconds.

### 3.6 No Overload

The app must support challenge and pressure, but should avoid requiring every project every day. The central requirement is no-zero-day consistency, supported by weekly and monthly targets.

---

## 4. Target User

### 4.1 Primary User

The primary user is the app owner: a software engineer building a structured personal development challenge until 31 December 2026.

### 4.2 User Characteristics

The user:

* Likes challenging long-term goals.
* Enjoys projects that force consistency.
* Wants visible progress.
* Is currently training for a virgin marathon.
* Is building a personal product called Vinance.
* Wants to improve English for career purposes.
* Wants to learn Korean as a fun secondary language.
* Wants to write devlogs.
* Wants to improve taste and conversation skills.
* Wants a small app that can be used daily.
* Wants zero-cost storage and deployment.
* Accepts local storage as enough for the initial implementation.

### 4.3 User Needs

The user needs:

1. A daily tracker.
2. A streak system.
3. A project dashboard.
4. A scoring system.
5. A way to track different project types.
6. Lightweight note-taking.
7. Weekly and monthly review structure.
8. Export and import.
9. Offline access.
10. Mobile-friendly interface.

---

## 5. Scope

### 5.1 Full Product Scope

The app must support:

1. Daily check-ins
2. Project tracks
3. Minimum, normal, and strong actions
4. Streak tracking
5. Points and scoring
6. Weekly dashboard
7. Monthly mission dashboard
8. Project-specific notes
9. Vinance project tracking
10. Devlog tracking
11. English practice tracking
12. Korean learning tracking
13. Taste-building notes
14. Conversation reflections
15. Optional marathon-related reflections
16. Search and filtering
17. Tags
18. Calendar view
19. Statistics and analytics
20. Export/import
21. Data backup
22. PWA install support
23. Offline usage
24. Local notifications where supported
25. Settings and customization
26. Failure recovery rules
27. End-of-year review generation

### 5.2 Storage Scope

The product must use browser-based local storage for cost-free usage.

The implementation may start with `localStorage`.

The product must be designed so storage can later be migrated to more robust local-first storage such as IndexedDB without changing the core product behavior.

### 5.3 Deployment Scope

The app must support:

1. Running locally.
2. Static hosting.
3. PWA installation.
4. Offline usage after initial load.

No backend deployment is required for the core product.

---

## 6. Information Architecture

### 6.1 Main Navigation

The app must include the following primary sections:

1. Today
2. Projects
3. Calendar
4. Weekly Review
5. Monthly Missions
6. Artifacts
7. Insights
8. Settings

### 6.2 Today Page

Purpose:

The Today page is the daily command center.

It must show:

1. Current date
2. Today’s no-zero-day status
3. Current streak
4. Longest streak
5. Today’s suggested actions
6. Quick add activity buttons
7. Today’s completed logs
8. Weekly score preview
9. Missing weekly targets
10. A low-energy action option

### 6.3 Projects Page

Purpose:

The Projects page displays all active tracks.

Project tracks:

1. English
2. Korean
3. Vinance
4. Devlog
5. Taste-Building
6. Conversation
7. Optional: Marathon Reflection

Each project page must show:

1. Project description
2. End-of-year goal
3. Weekly target
4. Current week progress
5. Total sessions
6. Total points
7. Notes
8. Artifacts
9. Activity history
10. Project-specific templates

### 6.4 Calendar Page

Purpose:

The Calendar page shows daily consistency visually.

It must support:

1. Monthly calendar view
2. Daily completion status
3. Point total per day
4. Track indicators per day
5. Missed days
6. Streak breaks
7. Click day to view logs
8. Filter by project
9. Highlight current day

### 6.5 Weekly Review Page

Purpose:

The Weekly Review page helps the user close each week intentionally.

It must show:

1. Weekly score
2. Active days
3. Completed project sessions
4. Missed targets
5. Artifacts created
6. Best progress
7. Biggest blocker
8. Next week priority
9. Written review form
10. Weekly status

Weekly status categories:

* Failed week
* Minimum win
* Good week
* Excellent week

Default thresholds:

* Minimum win: 15+ points
* Good week: 22+ points
* Excellent week: 28+ points

Thresholds must be configurable.

### 6.6 Monthly Missions Page

Purpose:

The Monthly Missions page tracks larger semester-level missions.

Required months:

1. June 2026
2. July 2026
3. August 2026
4. September 2026
5. October 2026
6. November 2026
7. December 2026

Default mission themes:

| Month     | Mission                   |
| --------- | ------------------------- |
| June      | Build the system          |
| July      | Start the engine          |
| August    | Build momentum            |
| September | Raise the standard        |
| October   | Marathon discipline month |
| November  | Product maturity          |
| December  | Year packaging            |

Each monthly mission must support:

1. Title
2. Description
3. Checklist
4. Target artifacts
5. Progress percentage
6. Notes
7. Monthly review
8. Completed status

### 6.7 Artifacts Page

Purpose:

The Artifacts page collects evidence of progress.

Artifact types:

1. Devlog
2. Taste note
3. Conversation reflection
4. English practice note
5. Korean learning note
6. Vinance milestone
7. Weekly review
8. Monthly review
9. Marathon reflection
10. Custom artifact

Each artifact must support:

1. Title
2. Type
3. Date
4. Linked project
5. Tags
6. Content
7. External link
8. Completion status
9. Created timestamp
10. Updated timestamp

### 6.8 Insights Page

Purpose:

The Insights page summarizes progress and patterns.

It must show:

1. Total active days
2. Current streak
3. Longest streak
4. Total points
5. Points by project
6. Sessions by project
7. Weekly trend
8. Monthly trend
9. Most consistent project
10. Weakest project
11. Best day of week
12. Most productive time, if time data is available
13. Artifact count
14. Missed days
15. Recovery after missed days
16. End-of-year progress projection

### 6.9 Settings Page

Purpose:

The Settings page controls configuration and data safety.

It must support:

1. Edit project tracks
2. Edit point values
3. Edit weekly targets
4. Edit monthly missions
5. Export data
6. Import data
7. Reset data
8. Clear specific project data
9. Theme settings
10. PWA install instructions
11. Notification settings
12. Data version display
13. Storage usage display

---

## 7. Core Features

## 7.1 Daily Check-In

### Description

The user must be able to add a completed action quickly.

### Requirements

The check-in form must support:

1. Project track
2. Action level
3. Title
4. Duration
5. Notes
6. Points
7. Tags
8. Date
9. Optional artifact link
10. Save button

### Action Levels

Each activity can be marked as:

1. Minimum
2. Normal
3. Strong

### Required Behavior

When the user saves at least one activity for the current date, the day becomes a non-zero day.

### Acceptance Criteria

* User can add an activity in under 30 seconds.
* Activity is saved locally.
* Today’s status updates immediately.
* Weekly points update immediately.
* Streak updates correctly.
* User can edit or delete the activity.

---

## 7.2 Project Tracks

### Description

Each project track represents one area of the semester challenge.

### Default Tracks

| Track               | Purpose                        |
| ------------------- | ------------------------------ |
| English             | Career communication practice  |
| Korean              | Fun language learning          |
| Vinance             | Personal product building      |
| Devlog              | Written progress output        |
| Taste-Building      | Judgment and taste improvement |
| Conversation        | Social intelligence practice   |
| Marathon Reflection | Optional discipline reflection |

### Requirements

Each project track must support:

1. Name
2. Description
3. Color/icon
4. Weekly target
5. Point value
6. Minimum action
7. Normal action
8. Strong action
9. End-of-year goal
10. Activity history
11. Notes
12. Artifacts
13. Active/inactive status

### Acceptance Criteria

* User can view all tracks.
* User can customize tracks.
* User can add activity to any active track.
* User can filter logs by track.
* User can view track-level progress.

---

## 7.3 No-Zero-Day Streak

### Description

The app must track whether the user completed at least one meaningful action per day.

### Requirements

The streak system must show:

1. Today completed or not
2. Current streak
3. Longest streak
4. Last completed day
5. Missed days
6. Streak calendar
7. Recovery status after missed day

### Streak Rules

Default rule:

A day counts as completed if at least one activity log exists for that date.

The rule must be configurable later.

### Acceptance Criteria

* Current streak is calculated from activity logs.
* Longest streak is calculated from historical logs.
* Missed days are visible.
* Streak recalculates after editing/deleting logs.
* Time zone handling is consistent with the user’s local date.

---

## 7.4 Points System

### Description

The app must turn actions into points so the user can evaluate weekly effort.

### Default Point Values

| Track          | Default Points |
| -------------- | -------------: |
| English        |              2 |
| Korean         |              1 |
| Vinance        |              3 |
| Devlog         |              2 |
| Taste-Building |              1 |
| Conversation   |              1 |
| Weekly Review  |              3 |
| Monthly Review |              5 |

### Requirements

The points system must support:

1. Default points by project
2. Manual override per activity
3. Bonus points
4. Weekly total
5. Monthly total
6. Project-specific totals
7. Score status
8. Configurable thresholds

### Acceptance Criteria

* Points update immediately after activity creation.
* User can override points.
* Weekly score is visible.
* Monthly score is visible.
* Points by project are visible.

---

## 7.5 Weekly Targets

### Description

Each project track must have weekly targets.

### Default Weekly Targets

| Track          | Weekly Target |
| -------------- | ------------: |
| English        |    5 sessions |
| Korean         |    3 sessions |
| Vinance        |    5 sessions |
| Devlog         |    2 sessions |
| Taste-Building |       2 notes |
| Conversation   |        2 reps |

### Requirements

The app must show:

1. Target per project
2. Completed sessions this week
3. Remaining sessions
4. Missing projects
5. Overachieved projects
6. Weekly status

### Acceptance Criteria

* Weekly targets reset by calendar week.
* User can edit weekly targets.
* Progress is calculated from logs.
* Missing targets are visible.

---

## 7.6 Monthly Missions

### Description

Monthly missions create larger goals beyond daily actions.

### Requirements

Each monthly mission must include:

1. Month
2. Title
3. Theme
4. Description
5. Checklist
6. Target artifacts
7. Progress
8. Notes
9. Review
10. Completion status

### Default Monthly Missions

#### June 2026 — Build the System

Deliverables:

* App initialized
* Project tracks defined
* Weekly targets defined
* Vinance roadmap added
* First taste note added
* First conversation reflection added

#### July 2026 — Start the Engine

Deliverables:

* First consistent month
* 4 devlogs
* Vinance finance domain model
* 15+ English reps
* 10+ Korean reps

#### August 2026 — Build Momentum

Deliverables:

* Transaction CRUD progress in Vinance
* 4 devlogs
* 8+ taste notes total
* 8+ conversation reflections total

#### September 2026 — Raise the Standard

Deliverables:

* Monthly summary or dashboard progress in Vinance
* Stronger English technical explanation notes
* Korean consistency maintained
* Better devlog quality

#### October 2026 — Marathon Discipline Month

Deliverables:

* Maintain no-zero-day during marathon month
* Marathon reflection artifact
* At least one marathon-themed devlog or essay
* Minimum activity maintained during fatigue

#### November 2026 — Product Maturity

Deliverables:

* Vinance usability improved
* Portfolio positioning notes
* Documentation improved
* Taste analysis quality improved

#### December 2026 — Year Packaging

Deliverables:

* Year review
* Semester reflection
* Best devlogs collection
* Vinance portfolio summary
* Personal transformation review

### Acceptance Criteria

* User can view current month mission.
* User can complete checklist items.
* User can add custom checklist items.
* Monthly progress percentage updates.
* User can write a monthly review.

---

## 7.7 English Practice Module

### Purpose

Support English communication growth for career, technical explanation, and personal reflection.

### Supported Activity Types

1. Speaking practice
2. Writing practice
3. Voice recording note
4. Technical explanation
5. Career answer practice
6. Reflection writing
7. Devlog drafting
8. Mock interview preparation

### Required Fields

1. Topic
2. Practice type
3. Duration
4. Confidence rating
5. Notes
6. Mistakes noticed
7. Improved version
8. Tags

### Templates

Default English templates:

#### Technical Explanation

* What did I explain?
* What was the main idea?
* Which words were difficult?
* How can I explain it better next time?

#### Career Answer

* Question:
* My answer:
* Weak part:
* Better answer:
* Keywords to remember:

#### Weekly Reflection

* What happened this week?
* What did I learn?
* What was difficult?
* What will I improve next week?

### Acceptance Criteria

* User can log English practice.
* User can classify practice type.
* User can review previous English reps.
* User can track total English sessions.

---

## 7.8 Korean Fun Learning Module

### Purpose

Support Korean as a light, fun, sustainable language habit.

### Supported Activity Types

1. Vocabulary review
2. Hangul reading
3. Listening
4. Short lesson
5. Grammar note
6. Korean media observation
7. Phrase collection

### Required Fields

1. Activity type
2. Words learned
3. Phrases learned
4. Source
5. Duration
6. Enjoyment rating
7. Notes

### Product Rule

Korean must remain a low-pressure habit. The product should track consistency but should not punish missed Korean sessions beyond normal weekly target visibility.

### Acceptance Criteria

* User can log Korean activity.
* User can store vocabulary or phrases.
* User can mark the session as fun, neutral, or difficult.
* User can see total Korean sessions.

---

## 7.9 Vinance Product Tracker Module

### Purpose

Support progress on the user’s personal product, Vinance.

### Supported Activity Types

1. Coding
2. Product planning
3. PRD/SDD writing
4. Architecture thinking
5. UI design
6. Bug fixing
7. Refactoring
8. Documentation
9. Testing
10. Release preparation

### Required Fields

1. Task title
2. Activity type
3. Related feature
4. Duration
5. Progress note
6. Blocker
7. Next step
8. Commit link, optional
9. Devlog link, optional
10. Status

### Vinance Feature Tracking

The module must support feature records.

Feature fields:

1. Feature name
2. Description
3. Status
4. Priority
5. Related module
6. Notes
7. Tasks
8. Completion percentage
9. Created date
10. Updated date

Default Vinance module focus:

1. Finance tracking
2. Transaction CRUD
3. Category management
4. Account/wallet tracking
5. Monthly summary
6. Budgeting
7. Dashboard
8. Reports
9. Future AI summary
10. Future natural language query

### Acceptance Criteria

* User can log Vinance development sessions.
* User can create and update Vinance features.
* User can track blockers.
* User can link devlogs to Vinance work.
* User can see Vinance progress over time.

---

## 7.10 Devlog Module

### Purpose

Support weekly writing output.

### Supported Devlog Types

1. Product devlog
2. Technical note
3. Weekly reflection
4. Marathon-related essay
5. Learning note
6. Taste reflection
7. Conversation insight
8. Portfolio post draft

### Required Fields

1. Title
2. Type
3. Status
4. Draft content
5. Published link
6. Related project
7. Tags
8. Word count
9. Created date
10. Updated date

### Devlog Statuses

1. Idea
2. Drafting
3. Reviewed
4. Published
5. Archived

### Default Devlog Template

```md
# Devlog Week X — Title

## What I built
...

## Why it matters
...

## Technical decision
...

## Problem I faced
...

## What I learned
...

## Next step
...
```

### Acceptance Criteria

* User can create devlog drafts.
* User can update devlog status.
* User can link devlogs to Vinance or other projects.
* User can count weekly devlog progress.
* User can view all devlogs in Artifacts.

---

## 7.11 Taste-Building Module

### Purpose

Help the user improve judgment, design sense, lifestyle awareness, and product taste.

### Supported Categories

1. Food/drink
2. Place
3. Product
4. Visual design
5. Storytelling
6. Lifestyle
7. Software/app
8. City observation
9. Coffee shop/cafe
10. Custom category

### Required Fields

1. Item/place name
2. Category
3. Location, optional
4. First impression
5. What is good?
6. What is not good?
7. Why does it work or not work?
8. What can I steal for my life/product/communication?
9. Rating, optional
10. Tags
11. Photo reference, optional text/link only for local-storage MVP
12. Date

### Acceptance Criteria

* User can create taste notes.
* User can categorize taste notes.
* User can review all taste notes.
* User can filter by category.
* User can link taste insight to Vinance or lifestyle.

---

## 7.12 Conversation Skill Module

### Purpose

Support deliberate improvement in asking questions, listening, reflecting, and following up.

### Supported Activity Types

1. Intentional question
2. Deep conversation
3. Alumni dinner reflection
4. Career conversation
5. Friend conversation
6. Family conversation
7. Community conversation
8. Follow-up action

### Required Fields

1. Conversation context
2. Person/group, optional
3. Question asked
4. Best insight heard
5. What I noticed about myself
6. What I should improve
7. Follow-up action
8. Date
9. Tags

### Default Question Bank

The app must support a built-in question bank.

Default questions:

1. What skill helped you most after college?
2. What did you misunderstand about career when you were younger?
3. What kind of people grow fast in your workplace?
4. What habit changed your life the most?
5. What would you do differently if you were 24 again?
6. What are you currently trying to improve?
7. What changed your mind recently?
8. What do most people misunderstand about your work?
9. What decision helped you most?
10. What kind of life are you trying to build?

### Acceptance Criteria

* User can log a conversation reflection.
* User can use or customize question prompts.
* User can track total conversation reps.
* User can set follow-up actions.
* User can mark follow-ups complete.

---

## 7.13 Marathon Reflection Support

### Purpose

Support optional reflection related to marathon discipline, especially during October 2026.

The app is not a full running tracker. It only supports reflection and discipline tracking connected to the semester challenge.

### Supported Activity Types

1. Long run reflection
2. Marathon training lesson
3. Race preparation note
4. Recovery note
5. Discipline note

### Required Fields

1. Distance, optional
2. Pace, optional
3. Energy level
4. Mental condition
5. What worked
6. What failed
7. Lesson for marathon
8. Date

### Acceptance Criteria

* User can log marathon-related reflections.
* Marathon reflections can count toward no-zero-day if enabled.
* Marathon reflections can appear as artifacts.
* October mission can include marathon reflection deliverables.

---

## 7.14 Search and Filtering

### Requirements

The app must support search across:

1. Activity logs
2. Notes
3. Artifacts
4. Devlogs
5. Taste notes
6. Conversation reflections
7. Vinance tasks
8. Monthly reviews

Filter options:

1. Date range
2. Project track
3. Artifact type
4. Tags
5. Status
6. Action level
7. Points
8. Month
9. Week

### Acceptance Criteria

* User can search text content.
* User can filter by project.
* User can filter by date.
* Search results show relevant item type and date.
* User can open result detail.

---

## 7.15 Tags

### Requirements

The app must support tags for organization.

Examples:

* career
* technical
* marathon
* coffee
* design
* conversation
* reflection
* backend
* frontend
* finance
* english-speaking
* korean-vocab

### Acceptance Criteria

* User can add tags to logs and artifacts.
* User can filter by tag.
* User can view all tags.
* User can remove tags.

---

## 7.16 Export and Import

### Description

Because the app uses local storage, data backup is required.

### Requirements

The app must support:

1. Export all data as JSON.
2. Import JSON backup.
3. Validate imported data.
4. Show import summary before applying.
5. Warn before overwrite.
6. Merge or replace import mode.
7. Export selected date range.
8. Export selected project.
9. Export human-readable Markdown summary.
10. Export year-end review data.

### Acceptance Criteria

* User can export full backup.
* User can import previous backup.
* Invalid data is rejected safely.
* User receives clear confirmation after import/export.
* Existing data is not accidentally destroyed without warning.

---

## 7.17 Local Notifications

### Description

The app should support reminders where browser/PWA capability allows.

### Requirements

Notification types:

1. Daily no-zero reminder
2. Evening warning if no activity logged
3. Weekly review reminder
4. Monthly review reminder
5. Custom project reminder

### Acceptance Criteria

* User can enable or disable notifications.
* User can configure reminder time.
* Notifications work only after permission.
* App degrades gracefully if notifications are unavailable.

---

## 7.18 Settings and Customization

### Requirements

User can customize:

1. Project names
2. Project descriptions
3. Project icons/colors
4. Point values
5. Weekly targets
6. Monthly missions
7. Streak rules
8. Theme
9. Date format
10. Start day of week
11. Export behavior
12. Notification settings

### Acceptance Criteria

* Settings are saved locally.
* Changes reflect immediately.
* Defaults can be restored.
* User can reset app data only after confirmation.

---

## 8. User Stories

### 8.1 Daily Tracking

As a user, I want to quickly log a small action so that I can maintain my no-zero-day streak.

Acceptance criteria:

* I can select a project.
* I can enter a short note.
* I can save the activity.
* The app marks today as complete.

### 8.2 Low-Energy Day

As a user, I want the app to suggest a minimum action so that I can still win when I am tired.

Acceptance criteria:

* The Today page shows minimum actions.
* I can complete a minimum action quickly.
* The day counts as non-zero.

### 8.3 Weekly Review

As a user, I want to review my week so that I know whether I actually made progress.

Acceptance criteria:

* I can see weekly score.
* I can see completed sessions by project.
* I can write a weekly reflection.
* I can define next week’s priority.

### 8.4 Vinance Progress

As a user, I want to track Vinance tasks and sessions so that I can build my product consistently.

Acceptance criteria:

* I can create Vinance tasks/features.
* I can log development sessions.
* I can link devlogs.
* I can see Vinance progress.

### 8.5 Devlog Output

As a user, I want to draft and track devlogs so that I produce weekly artifacts.

Acceptance criteria:

* I can create a devlog.
* I can save draft content.
* I can update status.
* I can link it to a project.

### 8.6 Taste-Building

As a user, I want to record taste observations so that I improve my judgment.

Acceptance criteria:

* I can create a taste note.
* I can categorize it.
* I can write what works and what does not.
* I can review past notes.

### 8.7 Conversation Skill

As a user, I want to reflect on intentional conversations so that I become better at asking, listening, and following up.

Acceptance criteria:

* I can log a conversation.
* I can store questions and insights.
* I can define follow-up actions.
* I can track conversation reps.

### 8.8 Data Ownership

As a user, I want to export my data so that I do not lose my progress.

Acceptance criteria:

* I can export JSON.
* I can import JSON.
* I can export Markdown summaries.
* I can restore from backup.

---

## 9. Data Model

### 9.1 Track

```ts
type TrackId =
  | "english"
  | "korean"
  | "vinance"
  | "devlog"
  | "taste"
  | "conversation"
  | "marathon"
  | "weekly_review"
  | "monthly_review"
  | string;

type Track = {
  id: TrackId;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  active: boolean;
  defaultPoints: number;
  weeklyTarget: number;
  minimumAction: string;
  normalAction: string;
  strongAction: string;
  endOfYearGoal?: string;
  createdAt: string;
  updatedAt: string;
};
```

### 9.2 Activity Log

```ts
type ActionLevel = "minimum" | "normal" | "strong";

type ActivityLog = {
  id: string;
  date: string; // YYYY-MM-DD
  trackId: TrackId;
  actionLevel: ActionLevel;
  title: string;
  note?: string;
  durationMinutes?: number;
  points: number;
  tags: string[];
  artifactIds?: string[];
  createdAt: string;
  updatedAt: string;
};
```

### 9.3 Artifact

```ts
type ArtifactType =
  | "devlog"
  | "taste_note"
  | "conversation_reflection"
  | "english_note"
  | "korean_note"
  | "vinance_milestone"
  | "weekly_review"
  | "monthly_review"
  | "marathon_reflection"
  | "custom";

type ArtifactStatus =
  | "idea"
  | "drafting"
  | "reviewed"
  | "published"
  | "completed"
  | "archived";

type Artifact = {
  id: string;
  type: ArtifactType;
  title: string;
  content: string;
  date: string;
  trackId?: TrackId;
  tags: string[];
  status: ArtifactStatus;
  externalLink?: string;
  createdAt: string;
  updatedAt: string;
};
```

### 9.4 Monthly Mission

```ts
type MissionChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};

type MonthlyMission = {
  id: string;
  month: string; // YYYY-MM
  title: string;
  theme: string;
  description?: string;
  checklist: MissionChecklistItem[];
  targetArtifactIds?: string[];
  review?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### 9.5 Vinance Feature

```ts
type FeatureStatus =
  | "idea"
  | "planned"
  | "in_progress"
  | "blocked"
  | "done"
  | "archived";

type VinanceFeature = {
  id: string;
  name: string;
  description?: string;
  module: string;
  priority: "low" | "medium" | "high" | "critical";
  status: FeatureStatus;
  tasks: VinanceTask[];
  notes?: string;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
};

type VinanceTask = {
  id: string;
  title: string;
  description?: string;
  status: FeatureStatus;
  createdAt: string;
  updatedAt: string;
};
```

### 9.6 App Settings

```ts
type AppSettings = {
  appVersion: string;
  startDate: string;
  endDate: string;
  weekStartsOn: "monday" | "sunday";
  weeklyScoreThresholds: {
    minimumWin: number;
    goodWeek: number;
    excellentWeek: number;
  };
  notifications: {
    enabled: boolean;
    dailyReminderTime?: string;
    weeklyReviewReminder?: string;
    monthlyReviewReminder?: string;
  };
  theme: "light" | "dark" | "system";
};
```

### 9.7 App State

```ts
type AppState = {
  tracks: Track[];
  activityLogs: ActivityLog[];
  artifacts: Artifact[];
  monthlyMissions: MonthlyMission[];
  vinanceFeatures: VinanceFeature[];
  settings: AppSettings;
};
```

---

## 10. Analytics Requirements

### 10.1 Daily Analytics

The app must calculate:

1. Today completed or not
2. Today points
3. Today activities
4. Today projects touched

### 10.2 Weekly Analytics

The app must calculate:

1. Weekly score
2. Active days
3. Activities per track
4. Points per track
5. Missing targets
6. Weekly status
7. Artifacts created

### 10.3 Monthly Analytics

The app must calculate:

1. Monthly score
2. Active days in month
3. Completion rate
4. Project distribution
5. Mission progress
6. Monthly artifact count

### 10.4 Semester Analytics

The app must calculate:

1. Total active days
2. No-zero-day completion percentage
3. Current streak
4. Longest streak
5. Total points
6. Total sessions by track
7. Total artifacts
8. Progress toward end-of-year goals

---

## 11. Review System

### 11.1 Weekly Review Template

```md
# Weekly Review

## Score
Total points:

## Active days
Active days:

## What went well?
...

## What did I skip or avoid?
...

## Best artifact this week
...

## Weakest project this week
...

## What made consistency easier?
...

## What made consistency harder?
...

## One priority for next week
...
```

### 11.2 Monthly Review Template

```md
# Monthly Review

## Month
...

## Mission
...

## Completed deliverables
...

## Best progress
...

## Biggest problem
...

## What I learned about myself
...

## What should change next month
...

## Next month focus
...
```

### 11.3 End-of-Year Review Template

```md
# 2026 Semester Challenge Review

## Time period
June 2026 — December 2026

## Total active days
...

## Longest streak
...

## Total points
...

## Biggest transformation
...

## English progress
...

## Korean progress
...

## Vinance progress
...

## Devlog progress
...

## Taste-building progress
...

## Conversation skill progress
...

## Marathon discipline lesson
...

## What I want to continue in 2027
...
```

---

## 12. PWA Requirements

### 12.1 Installability

The app must be installable as a PWA.

Requirements:

1. Web app manifest
2. App icon
3. Service worker
4. Offline shell
5. Responsive mobile layout

### 12.2 Offline Support

The app must work offline after initial load.

Offline requirements:

1. View existing data
2. Add activity logs
3. Edit activity logs
4. View dashboards
5. Create notes
6. Export data

### 12.3 Responsive Design

The app must support:

1. Mobile
2. Tablet
3. Desktop

Mobile is the primary daily-use target.

---

## 13. Non-Functional Requirements

### 13.1 Performance

* App should load quickly.
* Daily check-in should feel instant.
* Dashboard calculations should update immediately.
* Local operations should not require network.

### 13.2 Reliability

* Data should persist across reloads.
* Import/export must protect against data loss.
* Reset actions must require confirmation.

### 13.3 Privacy

* No account required.
* No backend required.
* No third-party analytics required.
* Data remains in the browser unless exported by the user.

### 13.4 Usability

* Daily check-in must be fast.
* Minimum action must be visible.
* Main dashboard must not feel overwhelming.
* The app must support low-energy days.

### 13.5 Accessibility

The app should support:

1. Keyboard navigation
2. Semantic HTML
3. Sufficient contrast
4. Clear labels
5. Responsive font sizes

---

## 14. Default Seed Data

### 14.1 Tracks

The app should initialize with these default tracks:

```json
[
  {
    "id": "english",
    "name": "English",
    "description": "Career communication practice",
    "defaultPoints": 2,
    "weeklyTarget": 5,
    "minimumAction": "Speak or write English for 3 minutes",
    "normalAction": "Practice English for 20 minutes",
    "strongAction": "Record or write a full technical explanation"
  },
  {
    "id": "korean",
    "name": "Korean",
    "description": "Fun language learning",
    "defaultPoints": 1,
    "weeklyTarget": 3,
    "minimumAction": "Review 5 Korean words",
    "normalAction": "Complete 15 minutes of Korean learning",
    "strongAction": "Complete a lesson and listening session"
  },
  {
    "id": "vinance",
    "name": "Vinance",
    "description": "Personal product building",
    "defaultPoints": 3,
    "weeklyTarget": 5,
    "minimumAction": "Work on Vinance for 10 minutes",
    "normalAction": "Complete one focused build session",
    "strongAction": "Ship or complete a meaningful feature/task"
  },
  {
    "id": "devlog",
    "name": "Devlog",
    "description": "Progress writing and reflection",
    "defaultPoints": 2,
    "weeklyTarget": 2,
    "minimumAction": "Write 2 devlog bullets",
    "normalAction": "Draft one section",
    "strongAction": "Publish or complete a devlog"
  },
  {
    "id": "taste",
    "name": "Taste-Building",
    "description": "Improve judgment through observation",
    "defaultPoints": 1,
    "weeklyTarget": 2,
    "minimumAction": "Capture 1 taste observation",
    "normalAction": "Write a structured taste note",
    "strongAction": "Analyze something deeply and extract lessons"
  },
  {
    "id": "conversation",
    "name": "Conversation",
    "description": "Practice intentional conversation",
    "defaultPoints": 1,
    "weeklyTarget": 2,
    "minimumAction": "Ask 1 better question",
    "normalAction": "Reflect on one conversation",
    "strongAction": "Have an intentional conversation and follow up"
  }
]
```

---

## 15. Success Metrics

### 15.1 Product Usage Metrics

The product is successful if the user can track:

1. Daily activity
2. Weekly progress
3. Monthly missions
4. Project artifacts
5. End-of-year review data

### 15.2 Behavioral Success Metrics

Target by 31 December 2026:

| Metric                      |              Target |
| --------------------------- | ------------------: |
| English reps                |                100+ |
| Korean sessions             |                 50+ |
| Devlogs                     |                 20+ |
| Taste notes                 |                 20+ |
| Conversation reflections    |                 20+ |
| Vinance sessions            |                100+ |
| Weekly reviews              |                 20+ |
| Monthly reviews             |                  6+ |
| No-zero-day completion rate | Configurable target |
| Artifacts created           |                 40+ |

### 15.3 Product Quality Metrics

The app should be considered successful if:

1. The user can log a daily action in under 30 seconds.
2. Data remains available offline.
3. Export/import works reliably.
4. The dashboard makes progress visible.
5. The user can complete weekly review without using another tool.
6. The app supports the full semester challenge until 31 December 2026.

---

## 16. Roadmap

### Phase 1 — Core Tracker

Goal:

Make the app usable for daily no-zero tracking.

Features:

1. Today page
2. Add activity
3. Edit/delete activity
4. Local storage persistence
5. Project tracks
6. Points
7. Today status
8. Current streak
9. Weekly score

### Phase 2 — Review and Missions

Goal:

Make the app useful weekly and monthly.

Features:

1. Weekly review
2. Weekly targets
3. Monthly missions
4. Monthly checklist
5. Calendar view
6. Artifacts page

### Phase 3 — Project Modules

Goal:

Support each project deeply.

Features:

1. English module
2. Korean module
3. Vinance module
4. Devlog module
5. Taste-building module
6. Conversation module
7. Marathon reflection support

### Phase 4 — Data Safety and PWA

Goal:

Make the app reliable as a daily tool.

Features:

1. Export JSON
2. Import JSON
3. Export Markdown
4. PWA install
5. Offline mode
6. Settings
7. Notifications

### Phase 5 — Insights and Year-End Review

Goal:

Make progress visible and meaningful.

Features:

1. Analytics dashboard
2. Semester progress
3. Project trends
4. Weakness detection
5. End-of-year review generator
6. Artifact collection summary

---

## 17. Risks and Mitigations

### Risk 1: The app becomes too complex to use daily

Mitigation:

* Today page must remain simple.
* Quick add must be available.
* Minimum action must be one tap or short form.

### Risk 2: Local storage data loss

Mitigation:

* Export/import must be built early.
* The app should remind the user to export backup regularly.
* Storage usage should be visible.

### Risk 3: The challenge becomes overwhelming

Mitigation:

* No-zero-day requires only one action.
* Each project has minimum/normal/strong levels.
* Weekly targets are visible but configurable.

### Risk 4: The app becomes a planning tool but not an action tool

Mitigation:

* Today page focuses on logging completed action.
* Weekly review focuses on evidence and artifacts.
* Dashboard prioritizes done work over future plans.

### Risk 5: Devlogs and reflections become scattered

Mitigation:

* Artifacts page centralizes all outputs.
* Tags and filters organize reflections.
* Export to Markdown enables long-term storage.

---

## 18. Open Items

These items are intentionally marked as configurable or TBD because they were not explicitly finalized.

1. Final product name: default is **No Zero**.
2. Final UI style: TBD.
3. Exact scoring thresholds: default values provided, configurable.
4. Exact no-zero-day target percentage: configurable.
5. Whether marathon reflection is active by default: optional.
6. Whether data should later migrate from localStorage to IndexedDB: implementation decision.
7. Whether devlogs are private-only or public-linked: both supported.
8. Whether PWA will be deployed publicly or used locally only: both supported.
9. Whether the app belongs inside the larger Vinance ecosystem later: supported but not required.

---

## 19. Definition of Done

The product is complete for the 2026 semester challenge when:

1. The user can install or open the app daily.
2. The user can log actions for all selected project tracks.
3. The app tracks no-zero-day status.
4. The app tracks current and longest streak.
5. The app calculates weekly points.
6. The app shows weekly target progress.
7. The app supports weekly reviews.
8. The app supports monthly missions.
9. The app supports devlogs.
10. The app supports taste notes.
11. The app supports conversation reflections.
12. The app supports English practice logs.
13. The app supports Korean learning logs.
14. The app supports Vinance project tracking.
15. The app supports artifact collection.
16. The app supports export/import.
17. The app works offline.
18. The app stores data locally.
19. The user can generate or write an end-of-year review from the data.
20. The product supports the user’s challenge until 31 December 2026.

---

## 20. Final Product Statement

No Zero is a local-first PWA that turns the user’s 2026 semester development plan into a daily challenge system. It exists to protect consistency, reduce friction, and make progress visible across English practice, Korean learning, Vinance development, devlog writing, taste-building, and conversation skill.

The app is not just a habit tracker. It is a personal campaign dashboard.

Its main success is simple:

> The user keeps showing up, every day, even with the smallest meaningful action.
