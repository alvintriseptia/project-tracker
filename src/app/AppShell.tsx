import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLiveQuery } from "dexie-react-hooks";
import {
  CalendarCheck2,
  FolderKanban,
  Menu,
  Plus,
  Settings,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { Button } from "../components/Button";
import { todayInTimeZone } from "../domain/dates";
import { db } from "../db/database";
import { SettingsRepository, TrackRepository } from "../db/repositories";
import { ActivityComposerProvider, useActivityComposer } from "../features/activities/ActivityComposerProvider";

const trackRepository = new TrackRepository(db);
const settingsRepository = new SettingsRepository(db);

const navigation = [
  { to: "/", label: "Today", icon: CalendarCheck2 },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/settings", label: "Settings", icon: Settings },
];

function ShellContent() {
  const { openCreate } = useActivityComposer();
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-ink p-5 text-white lg:flex lg:flex-col">
        <NavLink to="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white font-display text-xl font-bold text-ink">
            N
          </span>
          <span>
            <span className="block font-display text-xl font-semibold">
              No Zero
            </span>
            <span className="block text-xs text-white/55">
              Semester challenge
            </span>
          </span>
        </NavLink>
        <nav className="mt-10 grid gap-2" aria-label="Primary navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-xl px-3 font-semibold transition ${
                  isActive
                    ? "bg-white text-ink"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <item.icon size={19} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Button
          className="mt-auto bg-white text-ink hover:bg-emerald-50"
          onClick={() => openCreate()}
        >
          <Plus size={18} />
          Add activity
        </Button>
        <p className="mt-4 text-xs leading-relaxed text-white/65">
          Private and local. Your records stay in this browser.
        </p>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-canvas/90 px-4 backdrop-blur sm:px-6 lg:hidden">
          <NavLink to="/" className="font-display text-xl font-semibold">
            No Zero
          </NavLink>
          <Button size="sm" onClick={() => openCreate()}>
            <Plus size={18} />
            Add
          </Button>
        </header>
        <main className="mx-auto max-w-6xl px-4 pb-28 pt-7 sm:px-6 sm:pt-10 lg:px-10 lg:pb-12">
          <Outlet />
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-line bg-surface/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden"
        aria-label="Mobile navigation"
      >
        {navigation.slice(0, 2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold ${
                isActive ? "text-brand" : "text-muted"
              }`
            }
          >
            <item.icon size={21} />
            {item.label}
          </NavLink>
        ))}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold text-muted">
              <Menu size={21} />
              More
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={8}
              align="end"
              className="z-50 min-w-48 rounded-xl border border-line bg-surface p-1 shadow-xl"
            >
              <DropdownMenu.Item asChild>
                <NavLink
                  to="/settings"
                  className="flex min-h-11 items-center gap-2 rounded-lg px-3 font-semibold outline-none focus:bg-black/5"
                >
                  <Settings size={18} />
                  Settings
                </NavLink>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </nav>
    </div>
  );
}

export function AppShell() {
  const data = useLiveQuery(async () => {
    const [tracks, settings] = await Promise.all([
      trackRepository.listActive(),
      settingsRepository.get(),
    ]);
    return { tracks, today: todayInTimeZone(settings.timeZone) };
  }, []);

  if (!data) {
    return <p className="p-8 text-muted">Loading application...</p>;
  }

  return (
    <ActivityComposerProvider tracks={data.tracks} today={data.today}>
      <ShellContent />
    </ActivityComposerProvider>
  );
}
