import { startOfConfiguredWeek, endOfConfiguredWeek } from "./dates";
import type {
  Activity,
  AppSettings,
  Artifact,
  ArtifactStatus,
  ArtifactType,
  DateRange,
  EntityId,
  LocalDate,
  MonthlyMission,
  VinanceFeature,
  VinanceTask,
  WorkStatus,
  ActionLevel,
} from "./types";

export type SearchResultType =
  | "activity"
  | "artifact"
  | "mission"
  | "vinance_feature"
  | "vinance_task";

export type SearchFilters = {
  query?: string;
  from?: LocalDate;
  to?: LocalDate;
  trackId?: EntityId;
  artifactType?: ArtifactType;
  tags?: string[];
  status?: ArtifactStatus | WorkStatus;
  actionLevel?: ActionLevel;
  minPoints?: number;
  maxPoints?: number;
  month?: string;
  week?: LocalDate;
};

export type SearchCorpus = {
  activities: Activity[];
  artifacts: Artifact[];
  missions: MonthlyMission[];
  vinanceFeatures: VinanceFeature[];
  vinanceTasks: VinanceTask[];
  settings: Pick<AppSettings, "weekStartsOn">;
};

export type SearchResult = {
  id: EntityId;
  type: SearchResultType;
  title: string;
  date?: LocalDate;
  subtitle: string;
  excerpt: string;
  href: string;
  tags: string[];
  trackId?: EntityId;
  status?: string;
  points?: number;
};

type Candidate = SearchResult & {
  searchText: string;
  month?: string;
  actionLevel?: ActionLevel;
  artifactType?: ArtifactType;
};

export function searchRecords(
  corpus: SearchCorpus,
  filters: SearchFilters,
): SearchResult[] {
  const range = rangeFromFilters(filters, corpus.settings);
  const terms = normalizeText(filters.query ?? "")
    .split(" ")
    .filter(Boolean);
  const tags = (filters.tags ?? []).map(normalizeText).filter(Boolean);

  return candidatesFromCorpus(corpus)
    .filter((candidate) => {
      if (range && candidate.date) {
        if (candidate.date < range.from || candidate.date > range.to) return false;
      }
      if (filters.month && candidate.month !== filters.month) return false;
      if (filters.trackId && candidate.trackId !== filters.trackId) return false;
      if (filters.artifactType && candidate.artifactType !== filters.artifactType) return false;
      if (filters.status && candidate.status !== filters.status) return false;
      if (filters.actionLevel && candidate.actionLevel !== filters.actionLevel) return false;
      if (typeof filters.minPoints === "number" && (candidate.points ?? 0) < filters.minPoints) return false;
      if (typeof filters.maxPoints === "number" && (candidate.points ?? 0) > filters.maxPoints) return false;
      if (tags.length > 0) {
        const candidateTags = candidate.tags.map(normalizeText);
        if (!tags.every((tag) => candidateTags.includes(tag))) return false;
      }
      return terms.every((term) => candidate.searchText.includes(term));
    })
    .sort((left, right) => {
      const dateCompare = (right.date ?? "").localeCompare(left.date ?? "");
      return dateCompare || left.title.localeCompare(right.title);
    })
    .map(toSearchResult);
}

function candidatesFromCorpus(corpus: SearchCorpus): Candidate[] {
  const tasksByFeature = new Map<EntityId, VinanceTask[]>();
  for (const task of corpus.vinanceTasks) {
    tasksByFeature.set(task.featureId, [...(tasksByFeature.get(task.featureId) ?? []), task]);
  }

  return [
    ...corpus.activities.map((activity) => {
      const points = activity.points + activity.bonusPoints;
      return candidate({
        id: activity.id,
        type: "activity",
        title: activity.title,
        date: activity.date,
        subtitle: `${activity.level} activity`,
        excerpt: activity.note ?? `${points} points`,
        href: `/projects/${activity.trackId}`,
        tags: activity.tags,
        trackId: activity.trackId,
        points,
        actionLevel: activity.level,
        searchTextParts: [
          activity.title,
          activity.note,
          activity.level,
          activity.tags.join(" "),
          JSON.stringify(activity.metadata ?? {}),
        ],
      });
    }),
    ...corpus.artifacts.map((artifact) =>
      candidate({
        id: artifact.id,
        type: "artifact",
        title: artifact.title,
        date: artifact.date,
        subtitle: artifact.type.replaceAll("_", " "),
        excerpt: artifact.content || artifact.status,
        href: `/artifacts/${artifact.id}`,
        tags: artifact.tags,
        ...(artifact.trackId ? { trackId: artifact.trackId } : {}),
        status: artifact.status,
        artifactType: artifact.type,
        searchTextParts: [
          artifact.title,
          artifact.content,
          artifact.type,
          artifact.status,
          artifact.externalLink,
          artifact.tags.join(" "),
          JSON.stringify(artifact.details),
        ],
      }),
    ),
    ...corpus.missions.map((mission) =>
      candidate({
        id: mission.id,
        type: "mission",
        title: mission.title,
        date: `${mission.month}-01`,
        subtitle: `${mission.month} mission`,
        excerpt: mission.notes || mission.theme,
        href: `/missions/${mission.month}`,
        tags: [],
        status: mission.completed ? "done" : "in_progress",
        month: mission.month,
        searchTextParts: [
          mission.title,
          mission.theme,
          mission.description,
          mission.notes,
          mission.checklist.map((item) => item.label).join(" "),
        ],
      }),
    ),
    ...corpus.vinanceFeatures.map((feature) =>
      candidate({
        id: feature.id,
        type: "vinance_feature",
        title: feature.name,
        subtitle: `${feature.module} feature`,
        excerpt: feature.notes ?? feature.description ?? feature.priority,
        href: "/search",
        tags: [],
        status: feature.status,
        searchTextParts: [
          feature.name,
          feature.description,
          feature.module,
          feature.priority,
          feature.status,
          feature.notes,
          tasksByFeature.get(feature.id)?.map((task) => task.title).join(" "),
        ],
      }),
    ),
    ...corpus.vinanceTasks.map((task) =>
      candidate({
        id: task.id,
        type: "vinance_task",
        title: task.title,
        subtitle: "Vinance task",
        excerpt: task.description ?? task.status,
        href: "/search",
        tags: [],
        status: task.status,
        searchTextParts: [task.title, task.description, task.status],
      }),
    ),
  ];
}

function candidate(input: Omit<Candidate, "searchText" | "month"> & {
  searchTextParts: Array<string | undefined>;
  month?: string;
}): Candidate {
  const { searchTextParts, date, ...rest } = input;
  const result: Candidate = {
    ...rest,
    searchText: normalizeText(searchTextParts.filter(Boolean).join(" ")),
  };
  const month = input.month ?? date?.slice(0, 7);
  if (date) result.date = date;
  if (month) result.month = month;
  return result;
}

function toSearchResult(candidate: Candidate): SearchResult {
  const result: SearchResult = {
    id: candidate.id,
    type: candidate.type,
    title: candidate.title,
    subtitle: candidate.subtitle,
    excerpt: candidate.excerpt,
    href: candidate.href,
    tags: candidate.tags,
  };
  if (candidate.date) result.date = candidate.date;
  if (candidate.trackId) result.trackId = candidate.trackId;
  if (candidate.status) result.status = candidate.status;
  if (typeof candidate.points === "number") result.points = candidate.points;
  return result;
}

function rangeFromFilters(
  filters: SearchFilters,
  settings: Pick<AppSettings, "weekStartsOn">,
): DateRange | undefined {
  if (filters.week) {
    return {
      from: startOfConfiguredWeek(filters.week, settings.weekStartsOn),
      to: endOfConfiguredWeek(filters.week, settings.weekStartsOn),
    };
  }
  if (filters.from || filters.to) {
    return {
      from: filters.from ?? "0000-01-01",
      to: filters.to ?? "9999-12-31",
    };
  }
  return undefined;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
