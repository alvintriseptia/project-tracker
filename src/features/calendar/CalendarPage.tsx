import * as Dialog from "@radix-ui/react-dialog";
import { useLiveQuery } from "dexie-react-hooks";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useState } from "react";

import { Button } from "../../components/Button";
import { calendarGridRange, projectCalendarDays, type CalendarDay } from "../../domain/calendar";
import { todayInTimeZone, yearMonthFromDate } from "../../domain/dates";
import { db } from "../../db/database";
import { ActivityRepository, SettingsRepository, TrackRepository } from "../../db/repositories";
import { useActivityComposer } from "../activities/ActivityComposerProvider";

const activitiesRepository = new ActivityRepository(db);
const tracksRepository = new TrackRepository(db);
const settingsRepository = new SettingsRepository(db);

function shiftMonth(month: string, amount: number): string {
  const date = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1 + amount, 1));
  return date.toISOString().slice(0, 7);
}

export function CalendarPage() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [trackId, setTrackId] = useState("");
  const [selected, setSelected] = useState<CalendarDay>();
  const { openCreate, openEdit } = useActivityComposer();
  const data = useLiveQuery(async () => {
    const [settings, tracks] = await Promise.all([settingsRepository.get(), tracksRepository.list()]);
    const today = todayInTimeZone(settings.timeZone);
    const month = shiftMonth(yearMonthFromDate(today), monthOffset);
    const gridRange = calendarGridRange(month, settings.weekStartsOn);
    const activities = await activitiesRepository.listByDateRange(gridRange);
    return {
      settings,
      tracks,
      today,
      month,
      days: projectCalendarDays({
        month,
        weekStartsOn: settings.weekStartsOn,
        today,
        challengeRange: { from: settings.challengeStartDate, to: settings.challengeEndDate },
        activities,
        tracks,
        ...(trackId ? { trackId } : {}),
      }),
    };
  }, [monthOffset, trackId]);
  if (!data) return <p className="text-muted">Loading calendar…</p>;
  const tracks = new Map(data.tracks.map((track) => [track.id, track]));
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${data.month}-01T12:00:00Z`));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="section-kicker">Calendar</p><h1 className="mt-2 font-display text-4xl font-semibold">{monthLabel}</h1></div>
        <div className="flex gap-2">
          <select className="field-control min-w-44" aria-label="Filter calendar by project" value={trackId} onChange={(event) => setTrackId(event.target.value)}>
            <option value="">All projects</option>
            {data.tracks.map((track) => <option key={track.id} value={track.id}>{track.name}</option>)}
          </select>
          <Button variant="secondary" aria-label="Previous month" onClick={() => setMonthOffset((value) => value - 1)}><ChevronLeft /></Button>
          <Button variant="secondary" aria-label="Next month" onClick={() => setMonthOffset((value) => value + 1)}><ChevronRight /></Button>
        </div>
      </div>
      <div className="mt-7 grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase tracking-wide text-muted">
        {(data.settings.weekStartsOn === "monday" ? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]).map((day) => <div key={day} className="py-2">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {data.days.map((day) => {
          const stateText = day.state.replaceAll("_", " ");
          return (
            <button
              key={day.date}
              className={`min-h-20 rounded-xl border p-2 text-left transition hover:border-brand sm:min-h-28 ${
                day.isToday ? "ring-2 ring-brand" : ""
              } ${day.state === "active" ? "border-emerald-300 bg-emerald-50" : day.state === "missed" ? "border-red-200 bg-red-50" : "border-line bg-surface"} ${day.inMonth ? "" : "opacity-45"}`}
              aria-label={`${day.date}, ${stateText}, ${day.points} points`}
              onClick={() => setSelected(day)}
            >
              <span className="font-semibold">{Number(day.date.slice(-2))}</span>
              <span className="mt-2 hidden text-xs capitalize text-muted sm:block">{stateText}</span>
              {day.points > 0 ? <span className="mt-1 block text-xs font-bold text-brand">{day.points} pts</span> : null}
              <span className="mt-2 flex gap-1">
                {day.trackIds.slice(0, 3).map((id) => <span key={id} className="size-2 rounded-full" style={{ backgroundColor: tracks.get(id)?.color }} />)}
              </span>
            </button>
          );
        })}
      </div>
      <Dialog.Root open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(undefined); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/45" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(540px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-2xl">
            <div className="flex justify-between gap-4">
              <div><Dialog.Title className="font-display text-2xl font-semibold">{selected?.date}</Dialog.Title><Dialog.Description className="text-sm capitalize text-muted">{selected?.state.replaceAll("_", " ")} · {selected?.points} points</Dialog.Description></div>
              <Dialog.Close asChild><Button variant="ghost" aria-label="Close day details"><X /></Button></Dialog.Close>
            </div>
            <div className="mt-5 grid gap-3">
              {selected?.activities.length ? selected.activities.map((activity) => (
                <button key={activity.id} className="rounded-xl border border-line p-3 text-left hover:border-brand" onClick={() => openEdit(activity)}>
                  <span className="block font-semibold">{activity.title}</span><span className="text-sm text-muted">{tracks.get(activity.trackId)?.name} · {activity.points + activity.bonusPoints} pts</span>
                </button>
              )) : <p className="text-muted">No activities on this date.</p>}
            </div>
            <Button
              className="mt-5 w-full"
              onClick={() => {
                if (!selected) return;
                const date = selected.date;
                setSelected(undefined);
                openCreate({ date, ...(trackId ? { trackId } : {}) });
              }}
            >
              <Plus size={18} />Add activity for this date
            </Button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
