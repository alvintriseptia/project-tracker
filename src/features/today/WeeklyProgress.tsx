import { Card } from "../../components/Card";
import { StatusBadge } from "../../components/StatusBadge";
import type { TrackProgress, WeeklyStatus } from "../../domain/selectors";

const labels: Record<WeeklyStatus, string> = {
  failed: "Building",
  minimum_win: "Minimum win",
  good_week: "Good week",
  excellent_week: "Excellent week",
};

export function WeeklyProgress({
  points,
  status,
  progress,
}: {
  points: number;
  status: WeeklyStatus;
  progress: TrackProgress[];
}) {
  const missing = progress.filter((item) => item.remaining > 0);
  return (
    <section aria-labelledby="weekly-heading">
      <p className="section-kicker">This week</p>
      <h2 id="weekly-heading" className="section-title">
        Score and project targets
      </h2>
      <div className="mt-3 grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="bg-ink text-white">
          <StatusBadge
            tone={
              status === "excellent_week" || status === "good_week"
                ? "positive"
                : status === "minimum_win"
                  ? "warning"
                  : "neutral"
            }
          >
            {labels[status]}
          </StatusBadge>
          <p className="mt-5 font-display text-5xl font-semibold">{points}</p>
          <p className="text-sm text-white/65">points earned this week</p>
          <p className="mt-5 text-sm text-white/80">
            {missing.length === 0
              ? "Every active weekly target is complete."
              : `${missing.length} project target${missing.length === 1 ? "" : "s"} still need attention.`}
          </p>
        </Card>
        <Card>
          <div className="grid gap-4">
            {progress.map((item) => {
              const percentage = Math.min(
                (item.completed / item.target) * 100,
                100,
              );
              return (
                <div key={item.track.id}>
                  <div className="mb-1.5 flex justify-between gap-3 text-sm">
                    <span className="font-semibold">{item.track.name}</span>
                    <span className="text-muted">
                      {item.completed}/{item.target} sessions
                    </span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-line"
                    role="progressbar"
                    aria-label={`${item.track.name} weekly progress`}
                    aria-valuemin={0}
                    aria-valuemax={item.target}
                    aria-valuenow={Math.min(item.completed, item.target)}
                  >
                    <div
                      className="h-full rounded-full bg-brand transition-[width]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </section>
  );
}
