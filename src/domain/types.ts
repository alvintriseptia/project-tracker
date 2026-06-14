export type EntityId = string;
export type LocalDate = string;
export type YearMonth = string;
export type Instant = string;

export type AuditFields = {
  createdAt: Instant;
  updatedAt: Instant;
};

export type ActionLevel = "minimum" | "normal" | "strong";
export type TrackStatus = "active" | "archived";

export type Track = AuditFields & {
  id: EntityId;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: TrackStatus;
  sortOrder: number;
  defaultPoints: number;
  weeklyTarget: number;
  minimumAction: string;
  normalAction: string;
  strongAction: string;
  endOfYearGoal?: string;
  countsTowardNoZero: boolean;
};

export type Activity = AuditFields & {
  id: EntityId;
  date: LocalDate;
  trackId: EntityId;
  level: ActionLevel;
  title: string;
  note?: string;
  durationMinutes?: number;
  points: number;
  bonusPoints: number;
  tags: string[];
  artifactIds: EntityId[];
  metadata?: Record<string, unknown>;
};

export type ArtifactType =
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

export type ArtifactStatus =
  | "idea"
  | "drafting"
  | "reviewed"
  | "published"
  | "completed"
  | "archived";

export type WeeklyReviewDetails = {
  kind: "weekly_review";
  weekStart: LocalDate;
  weekEnd: LocalDate;
  wentWell: string;
  skippedOrAvoided: string;
  bestArtifactId?: EntityId;
  weakestTrackId?: EntityId;
  consistencyHelp: string;
  consistencyBlocker: string;
  nextWeekPriority: string;
};

export type MonthlyReviewDetails = {
  kind: "monthly_review";
  month: YearMonth;
  majorProgress: string;
  unfinishedWork: string;
  strongestTrackId?: EntityId;
  weakestTrackId?: EntityId;
  bestArtifactId?: EntityId;
  mainLesson: string;
  nextMonthFocus: string;
};

export type GenericArtifactDetails = {
  kind: "generic";
  [key: string]: unknown;
};

export type ArtifactDetails =
  | WeeklyReviewDetails
  | MonthlyReviewDetails
  | GenericArtifactDetails;

export type Artifact = AuditFields & {
  id: EntityId;
  type: ArtifactType;
  title: string;
  date: LocalDate;
  trackId?: EntityId;
  tags: string[];
  status: ArtifactStatus;
  content: string;
  externalLink?: string;
  details: ArtifactDetails;
};

export type MissionChecklistItem = {
  id: EntityId;
  label: string;
  completed: boolean;
  completedAt?: Instant;
};

export type MonthlyMission = AuditFields & {
  id: EntityId;
  month: YearMonth;
  title: string;
  theme: string;
  description?: string;
  checklist: MissionChecklistItem[];
  targetArtifactIds: EntityId[];
  notes: string;
  reviewArtifactId?: EntityId;
  completed: boolean;
};

export type WorkStatus =
  | "idea"
  | "planned"
  | "in_progress"
  | "blocked"
  | "done"
  | "archived";

export type VinanceFeature = AuditFields & {
  id: EntityId;
  name: string;
  description?: string;
  module: string;
  priority: "low" | "medium" | "high" | "critical";
  status: WorkStatus;
  notes?: string;
};

export type VinanceTask = AuditFields & {
  id: EntityId;
  featureId: EntityId;
  title: string;
  description?: string;
  status: WorkStatus;
  sortOrder: number;
};

export type AppSettings = {
  id: "app";
  challengeStartDate: LocalDate;
  challengeEndDate: LocalDate;
  weekStartsOn: "monday" | "sunday";
  locale: string;
  timeZone: string;
  theme: "light" | "dark" | "system";
  weeklyThresholds: {
    minimumWin: number;
    goodWeek: number;
    excellentWeek: number;
  };
  reminders: {
    enabled: boolean;
    dailyTime?: string;
    weeklyReviewDay?: number;
    weeklyReviewTime?: string;
    monthlyReviewTime?: string;
  };
  updatedAt: Instant;
};

export type DatabaseMetadata = {
  id: "database";
  schemaVersion: number;
  seedVersion: number;
  initializedAt: Instant;
  lastBackupAt?: Instant;
};

export type BackupEnvelope = {
  format: "no-zero-backup";
  schemaVersion: number;
  appVersion: string;
  exportedAt: Instant;
  selection: {
    mode: "full" | "date_range" | "track";
    from?: LocalDate;
    to?: LocalDate;
    trackId?: EntityId;
  };
  data: {
    tracks: Track[];
    activities: Activity[];
    artifacts: Artifact[];
    missions: MonthlyMission[];
    vinanceFeatures: VinanceFeature[];
    vinanceTasks: VinanceTask[];
    settings: AppSettings;
  };
};

export type DateRange = {
  from: LocalDate;
  to: LocalDate;
};
