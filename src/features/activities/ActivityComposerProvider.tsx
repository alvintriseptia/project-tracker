import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type { Activity, LocalDate, Track } from "../../domain/types";
import {
  ActivityDialog,
  type ActivityPrefill,
} from "./ActivityDialog";

type ActivityComposerValue = {
  openCreate: (prefill?: ActivityPrefill) => void;
  openEdit: (activity: Activity) => void;
};

const ActivityComposerContext = createContext<ActivityComposerValue | null>(null);

export function ActivityComposerProvider({
  children,
  tracks,
  today,
}: {
  children: React.ReactNode;
  tracks: Track[];
  today: LocalDate;
}) {
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState<ActivityPrefill | undefined>();
  const [activity, setActivity] = useState<Activity | undefined>();
  const openCreate = useCallback((nextPrefill?: ActivityPrefill) => {
    setActivity(undefined);
    setPrefill(nextPrefill);
    setOpen(true);
  }, []);
  const openEdit = useCallback((nextActivity: Activity) => {
    setPrefill(undefined);
    setActivity(nextActivity);
    setOpen(true);
  }, []);
  const value = useMemo(
    () => ({ openCreate, openEdit }),
    [openCreate, openEdit],
  );

  return (
    <ActivityComposerContext.Provider value={value}>
      {children}
      <ActivityDialog
        open={open}
        onOpenChange={setOpen}
        tracks={tracks}
        today={today}
        {...(prefill ? { prefill } : {})}
        {...(activity ? { activity } : {})}
      />
    </ActivityComposerContext.Provider>
  );
}

export function useActivityComposer(): ActivityComposerValue {
  const value = useContext(ActivityComposerContext);
  if (!value) {
    throw new Error(
      "useActivityComposer must be used inside ActivityComposerProvider.",
    );
  }
  return value;
}
