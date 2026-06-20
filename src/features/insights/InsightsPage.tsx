import { useLiveQuery } from "dexie-react-hooks";
import { BarChart3, FileText, Save } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { useToast } from "../../components/ToastProvider";
import { db } from "../../db/database";
import { readFullSnapshot } from "../../db/repositories";
import { artifactSchema } from "../../domain/schemas";
import { clampLocalDate, todayInTimeZone } from "../../domain/dates";
import { buildInsightsSummary } from "../../domain/insights";
import { buildYearEndReviewMarkdown } from "../../domain/yearEndReview";
import type { Artifact } from "../../domain/types";

export function InsightsPage() {
  const { announce } = useToast();
  const [draft, setDraft] = useState("");
  const [savedArtifact, setSavedArtifact] = useState<Artifact | undefined>();
  const data = useLiveQuery(async () => readFullSnapshot(db), []);

  const summary = useMemo(() => {
    if (!data) return undefined;
    return buildInsightsSummary({
      activities: data.activities,
      artifacts: data.artifacts,
      tracks: data.tracks,
      settings: data.settings,
      today: todayInTimeZone(data.settings.timeZone),
    });
  }, [data]);

  if (!data || !summary) return <p className="text-muted">Loading insights...</p>;

  const snapshot = data;
  const currentSummary = summary;

  const yearEndDate = clampLocalDate(todayInTimeZone(snapshot.settings.timeZone), {
    from: snapshot.settings.challengeStartDate,
    to: snapshot.settings.challengeEndDate,
  });

  function generateDraft() {
    setDraft(buildYearEndReviewMarkdown({
      insights: currentSummary,
      tracks: snapshot.tracks,
      artifacts: snapshot.artifacts,
    }));
  }

  async function saveDraft() {
    if (!draft.trim()) {
      announce("Generate or write a review draft before saving.");
      return;
    }
    const timestamp = new Date().toISOString();
    const artifact = artifactSchema.parse({
      id: savedArtifact?.id ?? crypto.randomUUID(),
      type: "custom",
      title: "2026 Semester Challenge Review",
      date: yearEndDate,
      tags: ["year-end-review", "semester-summary"],
      status: "drafting",
      content: draft,
      details: { kind: "generic" },
      createdAt: savedArtifact?.createdAt ?? timestamp,
      updatedAt: timestamp,
    }) as Artifact;
    await db.artifacts.put(artifact);
    setSavedArtifact(artifact);
    announce("Year-end review saved as an artifact.");
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Progress evidence</p>
          <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
            Insights
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            Review consistency, project trends, artifact output, and end-of-year review data.
          </p>
        </div>
        <Button onClick={generateDraft}>
          <FileText size={18} />
          Generate review
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Active days" value={summary.activeDays} />
        <Metric label="Current streak" value={summary.currentStreak} />
        <Metric label="Longest streak" value={summary.longestStreak} />
        <Metric label="Total points" value={summary.totalPoints} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <BarChart3 size={19} className="text-brand" />
            <h2 className="font-display text-2xl font-semibold">Weekly trend</h2>
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.weeklyTrend}>
                <CartesianGrid stroke="#d9ded8" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} width={32} />
                <Tooltip />
                <Line type="monotone" dataKey="points" stroke="#176b4d" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="sessions" stroke="#e6a23c" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-2xl font-semibold">Monthly trend</h2>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.monthlyTrend}>
                <CartesianGrid stroke="#d9ded8" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} width={32} />
                <Tooltip />
                <Bar dataKey="activeDays" fill="#176b4d" radius={[6, 6, 0, 0]} />
                <Bar dataKey="points" fill="#e6a23c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="section-kicker">Most consistent</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">
            {summary.mostConsistentProject?.track.name ?? "No data yet"}
          </h2>
          <p className="mt-2 text-muted">
            {formatRatio(summary.mostConsistentProject?.completionRatio ?? 0)} of elapsed target sessions.
          </p>
        </Card>
        <Card>
          <p className="section-kicker">Weakest project</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">
            {summary.weakestProject?.track.name ?? "No data yet"}
          </h2>
          <p className="mt-2 text-muted">
            {formatRatio(summary.weakestProject?.completionRatio ?? 0)} of elapsed target sessions.
          </p>
        </Card>
        <Card>
          <p className="section-kicker">Missed-day recovery</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">
            {summary.recovery.recoveredNextDay}/{summary.recovery.missedDays}
          </h2>
          <p className="mt-2 text-muted">
            {formatRatio(summary.recovery.rate)} recovered the next day.
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-2xl font-semibold">Project totals</h2>
          <div className="mt-4 grid gap-3">
            {summary.projectInsights.map((project) => (
              <div key={project.track.id} className="rounded-xl border border-line p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{project.track.name}</p>
                  <p className="text-sm text-muted">{formatRatio(project.completionRatio)}</p>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {project.sessions} sessions · {project.points} points · target {project.targetSessions}
                </p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-2xl font-semibold">Artifacts and targets</h2>
          <p className="mt-3 text-muted">{summary.artifactCount} active artifacts collected.</p>
          <div className="mt-4 grid gap-3">
            {summary.behavioralTargets.map((target) => (
              <div key={target.label}>
                <div className="flex justify-between gap-3 text-sm font-semibold">
                  <span>{target.label}</span>
                  <span>{target.current}/{target.target}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-line">
                  <div
                    className="h-2 rounded-full bg-brand"
                    style={{ width: `${Math.min((target.current / target.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Metric label="Best day" value={summary.bestDayOfWeek?.label ?? "Unavailable"} detail={`${summary.bestDayOfWeek?.activeDays ?? 0} active days`} />
        <Metric label="Productive time" value={summary.mostProductiveTime ? `${summary.mostProductiveTime.hour}:00` : "Unavailable"} detail={summary.mostProductiveTime ? `${summary.mostProductiveTime.sessions} sessions` : "No logged time metadata"} />
        <Metric label="Projection" value={summary.projection ? `${summary.projection.activeDays} days` : "Unavailable"} detail={summary.projection ? `${summary.projection.points} estimated points, ${summary.projection.basisWeeks} week basis` : "Needs two complete weeks"} />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-kicker">Year-end review</p>
            <h2 className="mt-2 font-display text-3xl font-semibold">Generated draft</h2>
          </div>
          <Button variant="secondary" onClick={() => void saveDraft()}>
            <Save size={18} />
            Save artifact
          </Button>
        </div>
        <textarea
          className="field-control mt-5 min-h-96 font-mono text-sm leading-relaxed"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Generate a review draft or write one here."
        />
      </Card>
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <Card>
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-2 font-display text-4xl font-semibold">{value}</p>
      {detail ? <p className="mt-2 text-sm text-muted">{detail}</p> : null}
    </Card>
  );
}

function formatRatio(value: number): string {
  return `${Math.round(value * 100)}%`;
}
