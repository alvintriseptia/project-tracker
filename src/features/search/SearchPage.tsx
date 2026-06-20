import { useLiveQuery } from "dexie-react-hooks";
import { Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { db } from "../../db/database";
import { readFullSnapshot } from "../../db/repositories";
import { searchRecords, type SearchFilters } from "../../domain/search";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [trackId, setTrackId] = useState("");
  const [artifactType, setArtifactType] = useState("");
  const [status, setStatus] = useState("");
  const [actionLevel, setActionLevel] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [tags, setTags] = useState("");
  const [month, setMonth] = useState("");
  const [week, setWeek] = useState("");
  const [minPoints, setMinPoints] = useState("");
  const [maxPoints, setMaxPoints] = useState("");

  const data = useLiveQuery(async () => readFullSnapshot(db), []);
  const results = useMemo(() => {
    if (!data) return [];
    const filters: SearchFilters = {
      query,
      ...(trackId ? { trackId } : {}),
      ...(artifactType ? { artifactType: artifactType as NonNullable<SearchFilters["artifactType"]> } : {}),
      ...(status ? { status: status as NonNullable<SearchFilters["status"]> } : {}),
      ...(actionLevel ? { actionLevel: actionLevel as NonNullable<SearchFilters["actionLevel"]> } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(month ? { month } : {}),
      ...(week ? { week } : {}),
      ...(tags.trim() ? { tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean) } : {}),
      ...(minPoints ? { minPoints: Number(minPoints) } : {}),
      ...(maxPoints ? { maxPoints: Number(maxPoints) } : {}),
    };
    return searchRecords(
      {
        activities: data.activities,
        artifacts: data.artifacts,
        missions: data.missions,
        vinanceFeatures: data.vinanceFeatures,
        vinanceTasks: data.vinanceTasks,
        settings: data.settings,
      },
      filters,
    );
  }, [actionLevel, artifactType, data, from, maxPoints, minPoints, month, query, status, tags, to, trackId, week]);

  if (!data) return <p className="text-muted">Loading search...</p>;

  return (
    <div className="grid gap-7">
      <div>
        <p className="section-kicker">Find evidence</p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
          Search
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Search activity logs, artifacts, reviews, missions, and Vinance records in this browser.
        </p>
      </div>

      <Card className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="relative md:col-span-2">
          <span className="sr-only">Search text</span>
          <Search className="absolute left-3 top-3 text-muted" size={18} />
          <input
            className="field-control pl-10"
            placeholder="Search title, notes, content, tags"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <select className="field-control" aria-label="Project" value={trackId} onChange={(event) => setTrackId(event.target.value)}>
          <option value="">All projects</option>
          {data.tracks.map((track) => (
            <option key={track.id} value={track.id}>{track.name}</option>
          ))}
        </select>
        <select className="field-control" aria-label="Artifact type" value={artifactType} onChange={(event) => setArtifactType(event.target.value)}>
          <option value="">All artifact types</option>
          {[...new Set(data.artifacts.map((artifact) => artifact.type))].map((type) => (
            <option key={type} value={type}>{type.replaceAll("_", " ")}</option>
          ))}
        </select>
        <select className="field-control" aria-label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {["idea", "drafting", "reviewed", "published", "completed", "archived", "planned", "in_progress", "blocked", "done"].map((value) => (
            <option key={value} value={value}>{value.replaceAll("_", " ")}</option>
          ))}
        </select>
        <select className="field-control" aria-label="Action level" value={actionLevel} onChange={(event) => setActionLevel(event.target.value)}>
          <option value="">All action levels</option>
          {["minimum", "normal", "strong"].map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
        <label><span className="field-label">From</span><input className="field-control" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
        <label><span className="field-label">To</span><input className="field-control" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
        <label><span className="field-label">Month</span><input className="field-control" type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label>
        <label><span className="field-label">Week of</span><input className="field-control" type="date" value={week} onChange={(event) => setWeek(event.target.value)} /></label>
        <label><span className="field-label">Tags</span><input className="field-control" placeholder="tag-one, tag-two" value={tags} onChange={(event) => setTags(event.target.value)} /></label>
        <label><span className="field-label">Min points</span><input className="field-control" min="0" type="number" value={minPoints} onChange={(event) => setMinPoints(event.target.value)} /></label>
        <label><span className="field-label">Max points</span><input className="field-control" min="0" type="number" value={maxPoints} onChange={(event) => setMaxPoints(event.target.value)} /></label>
      </Card>

      <section>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-brand" />
          <h2 className="font-display text-2xl font-semibold">
            {results.length} result{results.length === 1 ? "" : "s"}
          </h2>
        </div>
        {results.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No matching records" description="Adjust the search text or filters." />
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {results.map((result) => (
              <Link
                key={`${result.type}-${result.id}`}
                to={result.href}
                className="rounded-2xl border border-line bg-surface p-4 transition hover:border-brand hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-brand">{result.type.replaceAll("_", " ")}</p>
                    <h3 className="mt-1 font-display text-2xl font-semibold">{result.title}</h3>
                  </div>
                  <p className="text-sm font-semibold text-muted">{result.date ?? result.status ?? "Undated"}</p>
                </div>
                <p className="mt-2 text-sm font-semibold text-muted">{result.subtitle}</p>
                <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm">{result.excerpt}</p>
                {result.tags.length > 0 ? (
                  <p className="mt-3 text-xs font-semibold text-muted">{result.tags.join(", ")}</p>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
