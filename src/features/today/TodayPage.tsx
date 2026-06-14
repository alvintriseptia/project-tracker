import { Plus } from "lucide-react";

import { Button } from "../../components/Button";
import { useActivityComposer } from "../activities/ActivityComposerProvider";
import { MinimumSuggestions } from "./MinimumSuggestions";
import { TodayActivityList } from "./TodayActivityList";
import { TodayHeader } from "./TodayHeader";
import { useTodayData } from "./useTodayData";
import { WeeklyProgress } from "./WeeklyProgress";

export function TodayPage() {
  const data = useTodayData();
  const { openCreate } = useActivityComposer();

  if (!data) {
    return <p className="text-muted">Loading today’s progress...</p>;
  }

  return (
    <div className="grid gap-10">
      <TodayHeader
        date={data.today}
        todayActive={data.streaks.todayActive}
        currentStreak={data.streaks.current}
        longestStreak={data.streaks.longest}
      />
      <div className="rounded-3xl bg-brand px-5 py-5 text-white sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <div>
          <p className="font-display text-2xl font-semibold">
            Log what you completed
          </p>
          <p className="mt-1 text-sm text-white/90">
            Track, level, title. The rest is optional.
          </p>
        </div>
        <Button
          className="mt-4 bg-white text-brand hover:bg-emerald-50 sm:mt-0"
          onClick={() => openCreate()}
        >
          <Plus size={19} />
          Quick add
        </Button>
      </div>
      <MinimumSuggestions tracks={data.activeTracks} />
      <TodayActivityList
        activities={data.todayActivities}
        tracks={data.tracks}
      />
      <WeeklyProgress
        points={data.weeklyPoints}
        status={data.weeklyStatus}
        progress={data.progress}
      />
    </div>
  );
}
