import { ArrowRight } from "lucide-react";

import type { Track } from "../../domain/types";
import { useActivityComposer } from "../activities/ActivityComposerProvider";

export function MinimumSuggestions({ tracks }: { tracks: Track[] }) {
  const { openCreate } = useActivityComposer();
  return (
    <section aria-labelledby="suggestions-heading">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Low-energy options</p>
          <h2 id="suggestions-heading" className="section-title">
            Small actions still count
          </h2>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {tracks.map((track) => (
          <button
            key={track.id}
            className="group flex min-h-24 items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
            onClick={() =>
              openCreate({
                trackId: track.id,
                title: track.minimumAction,
              })
            }
          >
            <span>
              <span className="block text-xs font-bold uppercase tracking-wide text-muted">
                {track.name}
              </span>
              <span className="mt-1 block font-semibold">
                {track.minimumAction}
              </span>
            </span>
            <ArrowRight
              className="shrink-0 text-brand transition group-hover:translate-x-1"
              size={20}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
