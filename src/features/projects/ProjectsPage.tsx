import * as Collapsible from "@radix-ui/react-collapsible";
import { Archive, ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { useProjectsData } from "./useProjectsData";

function ProjectCard({
  item,
}: {
  item: NonNullable<ReturnType<typeof useProjectsData>>["tracks"][number];
}) {
  const progress = item.progress;
  const percentage = progress
    ? Math.min((progress.completed / progress.target) * 100, 100)
    : 0;
  return (
    <Link to={`/projects/${item.track.id}`} className="group block">
      <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:border-brand group-hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <span
            className="grid size-11 place-items-center rounded-xl text-lg font-bold text-white"
            style={{ backgroundColor: item.track.color }}
            aria-hidden="true"
          >
            {item.track.name.slice(0, 1)}
          </span>
          <ArrowRight
            className="text-muted transition group-hover:translate-x-1 group-hover:text-brand"
            size={20}
          />
        </div>
        <h2 className="mt-5 font-display text-2xl font-semibold">
          {item.track.name}
        </h2>
        <p className="mt-1 min-h-10 text-sm text-muted">
          {item.track.description}
        </p>
        <div className="mt-5 flex gap-5 text-sm">
          <span>
            <strong className="block text-lg text-ink">{item.totals.sessions}</strong>
            <span className="text-muted">sessions</span>
          </span>
          <span>
            <strong className="block text-lg text-ink">{item.totals.points}</strong>
            <span className="text-muted">points</span>
          </span>
        </div>
        {progress ? (
          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-xs font-semibold text-muted">
              <span>This week</span>
              <span>
                {progress.completed}/{progress.target}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        ) : null}
      </Card>
    </Link>
  );
}

export function ProjectsPage() {
  const data = useProjectsData();
  if (!data) return <p className="text-muted">Loading projects...</p>;

  const active = data.tracks.filter((item) => item.track.status === "active");
  const archived = data.tracks.filter(
    (item) => item.track.status === "archived",
  );

  return (
    <div>
      <p className="section-kicker">Project tracks</p>
      <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
        Build consistency across the work
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Weekly targets create direction without requiring every project every
        day.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {active.map((item) => (
          <ProjectCard key={item.track.id} item={item} />
        ))}
      </div>
      {active.length === 0 ? (
        <EmptyState
          title="No active projects"
          description="Restore an archived project to resume tracking."
        />
      ) : null}

      {archived.length > 0 ? (
        <Collapsible.Root className="mt-10">
          <Collapsible.Trigger className="group flex min-h-11 items-center gap-2 font-semibold">
            <Archive size={18} />
            Archived projects ({archived.length})
            <ChevronDown className="transition group-data-[state=open]:rotate-180" size={18} />
          </Collapsible.Trigger>
          <Collapsible.Content className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {archived.map((item) => (
              <ProjectCard key={item.track.id} item={item} />
            ))}
          </Collapsible.Content>
        </Collapsible.Root>
      ) : null}
    </div>
  );
}
