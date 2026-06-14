import { useLiveQuery } from "dexie-react-hooks";
import { Archive, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { db } from "../../db/database";
import { ArtifactRepository, TrackRepository } from "../../db/repositories";

const artifactsRepository = new ArtifactRepository(db);
const tracksRepository = new TrackRepository(db);

export function ArtifactsPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [trackId, setTrackId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const data = useLiveQuery(async () => ({
    artifacts: await artifactsRepository.list(),
    tracks: await tracksRepository.list(),
  }), []);
  const filtered = useMemo(() => {
    if (!data) return [];
    const normalized = query.trim().toLowerCase();
    return data.artifacts.filter((artifact) => {
      if (!showArchived && artifact.status === "archived") return false;
      if (type && artifact.type !== type) return false;
      if (status && artifact.status !== status) return false;
      if (trackId && artifact.trackId !== trackId) return false;
      if (from && artifact.date < from) return false;
      if (to && artifact.date > to) return false;
      return !normalized || [artifact.title, artifact.content, ...artifact.tags]
        .join(" ").toLowerCase().includes(normalized);
    });
  }, [data, from, query, showArchived, status, to, trackId, type]);
  if (!data) return <p className="text-muted">Loading artifacts…</p>;
  const tracks = new Map(data.tracks.map((track) => [track.id, track]));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Evidence</p>
          <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Artifacts</h1>
          <p className="mt-2 text-muted">Keep the outputs that prove the work happened.</p>
        </div>
        <Button asChild><Link to="/artifacts/new/custom"><Plus size={18} />New artifact</Link></Button>
      </div>
      <div className="mt-7 grid gap-3 rounded-2xl border border-line bg-surface p-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="relative">
          <span className="sr-only">Search artifacts</span>
          <Search className="absolute left-3 top-3 text-muted" size={18} />
          <input className="field-control pl-10" placeholder="Search title, content, or tags" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <select className="field-control" aria-label="Filter artifact type" value={type} onChange={(event) => setType(event.target.value)}>
          <option value="">All types</option>
          {[...new Set(data.artifacts.map((artifact) => artifact.type))].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
        </select>
        <select className="field-control" aria-label="Filter artifact status" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {["idea", "drafting", "reviewed", "published", "completed", "archived"].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select className="field-control" aria-label="Filter artifact project" value={trackId} onChange={(event) => setTrackId(event.target.value)}>
          <option value="">All projects</option>
          {data.tracks.map((track) => <option key={track.id} value={track.id}>{track.name}</option>)}
        </select>
        <label><span className="field-label">From</span><input className="field-control" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
        <label><span className="field-label">To</span><input className="field-control" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
        <label className="flex min-h-11 items-center gap-2 px-2 font-semibold">
          <input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />
          Archived
        </label>
      </div>
      {filtered.length === 0 ? (
        <div className="mt-6"><EmptyState title="No artifacts found" description="Create evidence or adjust the filters." /></div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((artifact) => (
            <Link key={artifact.id} to={`/artifacts/${artifact.id}`} className="rounded-2xl border border-line bg-surface p-5 transition hover:border-brand hover:shadow-md">
              <div className="flex justify-between gap-3">
                <StatusBadge tone={artifact.status === "archived" ? "neutral" : "positive"}>{artifact.status}</StatusBadge>
                {artifact.status === "archived" ? <Archive size={18} className="text-muted" /> : null}
              </div>
              <h2 className="mt-4 font-display text-2xl font-semibold">{artifact.title}</h2>
              <p className="mt-1 text-sm text-muted">{artifact.date} · {artifact.type.replaceAll("_", " ")}</p>
              {artifact.trackId ? <p className="mt-3 text-sm font-semibold">{tracks.get(artifact.trackId)?.name ?? "Archived project"}</p> : null}
              <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-muted">{artifact.content || "No content yet."}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
