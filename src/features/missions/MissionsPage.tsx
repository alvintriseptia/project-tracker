import { useLiveQuery } from "dexie-react-hooks";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

import { missionProgress } from "../../domain/missions";
import { todayInTimeZone } from "../../domain/dates";
import { db } from "../../db/database";
import { MissionRepository, SettingsRepository } from "../../db/repositories";

const missionsRepository = new MissionRepository(db);
const settingsRepository = new SettingsRepository(db);

export function MissionsPage() {
  const data = useLiveQuery(async () => {
    const [missions, settings] = await Promise.all([missionsRepository.list(), settingsRepository.get()]);
    return { missions, currentMonth: todayInTimeZone(settings.timeZone).slice(0, 7) };
  }, []);
  if (!data) return <p className="text-muted">Loading missions…</p>;
  return (
    <div>
      <p className="section-kicker">Monthly missions</p>
      <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">The semester arc</h1>
      <p className="mt-2 text-muted">Bigger outcomes built from checklists, evidence, and reflection.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {data.missions.map((mission) => {
          const progress = missionProgress(mission);
          const current = mission.month === data.currentMonth;
          return (
            <Link key={mission.id} to={`/missions/${mission.month}`} className={`group rounded-2xl border bg-surface p-5 transition hover:border-brand hover:shadow-md ${current ? "border-brand ring-2 ring-brand/10" : "border-line"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-brand">{mission.month}{current ? " · Current" : ""}</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold">{mission.title}</h2>
                  <p className="mt-1 text-sm text-muted">{mission.theme}</p>
                </div>
                {mission.completed ? <CheckCircle2 className="text-brand" /> : <ArrowRight className="text-muted transition group-hover:translate-x-1" />}
              </div>
              <div className="mt-5 flex justify-between text-sm"><span className="font-semibold">{progress}% complete</span><span className="text-muted">{mission.checklist.filter((item) => item.completed).length}/{mission.checklist.length} items</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} /></div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
