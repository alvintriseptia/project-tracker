import { useLiveQuery } from "dexie-react-hooks";
import {
  Bell,
  Database,
  Download,
  HardDrive,
  RefreshCcw,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";

import packageJson from "../../../package.json";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { useToast } from "../../components/ToastProvider";
import { db } from "../../db/database";
import { storageErrorMessage } from "../../db/errors";
import { initializeDatabase } from "../../db/initialize";
import {
  MetadataRepository,
  SettingsRepository,
  TrackRepository,
} from "../../db/repositories";
import type { BackupSelection } from "../../domain/backup";
import {
  applyImport,
  downloadFullBackup,
  downloadMarkdownExport,
  downloadSelectedBackup,
  estimateStorage,
  previewImport,
  resetApplicationData,
  type ImportPreview,
} from "./exportService";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

const settingsRepository = new SettingsRepository(db);
const metadataRepository = new MetadataRepository(db);
const trackRepository = new TrackRepository(db);

export function SettingsPage() {
  const data = useLiveQuery(async () => {
    const [settings, metadata, tracks] = await Promise.all([
      settingsRepository.get(),
      metadataRepository.get(),
      trackRepository.list(),
    ]);
    return { settings, metadata, tracks };
  }, []);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [storage, setStorage] = useState<{ usage?: number; quota?: number }>({});
  const [selectionMode, setSelectionMode] = useState<BackupSelection["mode"]>("full");
  const [selectionFrom, setSelectionFrom] = useState("");
  const [selectionTo, setSelectionTo] = useState("");
  const [selectionTrackId, setSelectionTrackId] = useState("");
  const [resetPhrase, setResetPhrase] = useState("");
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { announce } = useToast();

  useEffect(() => {
    void estimateStorage()
      .then(setStorage)
      .catch(() => setStorage({}));
  }, []);

  useEffect(() => {
    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", capturePrompt);
    return () => window.removeEventListener("beforeinstallprompt", capturePrompt);
  }, []);

  if (!data) return <p className="text-muted">Loading settings...</p>;

  async function exportBackup() {
    setExporting(true);
    try {
      const filename = await downloadFullBackup(db);
      announce(`${filename} downloaded.`);
    } catch (error) {
      announce(storageErrorMessage(error));
    } finally {
      setExporting(false);
    }
  }

  async function exportSelectedBackup() {
    setExporting(true);
    try {
      const filename = await downloadSelectedBackup(db, currentSelection());
      announce(`${filename} downloaded.`);
    } catch (error) {
      announce(storageErrorMessage(error));
    } finally {
      setExporting(false);
    }
  }

  async function exportMarkdown() {
    setExporting(true);
    try {
      const filename = await downloadMarkdownExport(db, currentSelection());
      announce(`${filename} downloaded.`);
    } catch (error) {
      announce(storageErrorMessage(error));
    } finally {
      setExporting(false);
    }
  }

  async function importFile(file: File | undefined) {
    if (!file) return;
    setImporting(true);
    try {
      const nextPreview = await previewImport(db, await file.text());
      setPreview(nextPreview);
      announce("Backup preview ready.");
    } catch (error) {
      setPreview(null);
      announce(storageErrorMessage(error));
    } finally {
      setImporting(false);
    }
  }

  async function applyPreview(mode: "merge" | "replace") {
    if (!preview) return;
    setImporting(true);
    try {
      await downloadFullBackup(db);
      await applyImport(db, preview, mode);
      setPreview(null);
      announce(`Backup ${mode === "merge" ? "merged" : "restored"}.`);
    } catch (error) {
      announce(storageErrorMessage(error));
    } finally {
      setImporting(false);
    }
  }

  async function resetData() {
    if (resetPhrase !== "RESET NO ZERO") return;
    setImporting(true);
    try {
      await downloadFullBackup(db);
      await resetApplicationData(db);
      await initializeDatabase(db);
      setResetPhrase("");
      announce("Application data reset.");
    } catch (error) {
      announce(storageErrorMessage(error));
    } finally {
      setImporting(false);
    }
  }

  async function saveReminderSettings(enabled: boolean) {
    try {
      const settings = await settingsRepository.get();
      if (enabled && "Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
      await settingsRepository.put({
        ...settings,
        reminders: { ...settings.reminders, enabled },
        updatedAt: new Date().toISOString(),
      });
      announce(enabled ? "Reminder prompts enabled." : "Reminder prompts disabled.");
    } catch (error) {
      announce(storageErrorMessage(error));
    }
  }

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  }

  function currentSelection(): BackupSelection {
    if (selectionMode === "date_range") {
      return {
        mode: "date_range",
        ...(selectionFrom ? { from: selectionFrom } : {}),
        ...(selectionTo ? { to: selectionTo } : {}),
      };
    }
    if (selectionMode === "track") {
      return {
        mode: "track",
        ...(selectionTrackId ? { trackId: selectionTrackId } : {}),
      };
    }
    return { mode: "full" };
  }

  return (
    <div className="grid gap-8">
      <header>
        <p className="section-kicker">Settings and data</p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
          Keep the challenge portable
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          No Zero stores records in this browser. Download a complete JSON
          backup regularly.
        </p>
      </header>

      <Card className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-100 text-brand">
            <ShieldCheck size={24} />
          </span>
          <div>
            <h2 className="font-display text-2xl font-semibold">
              Full local backup
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Includes tracks, activities, settings, and every schema-v1 table.
              The JSON file is the restorable format for future import support.
            </p>
            <p className="mt-2 text-xs text-muted">
              Last backup:{" "}
              {data.metadata.lastBackupAt
                ? new Date(data.metadata.lastBackupAt).toLocaleString()
                : "No backup recorded yet"}
            </p>
          </div>
        </div>
        <Button disabled={exporting} onClick={() => void exportBackup()}>
          <Download size={18} />
          {exporting ? "Preparing..." : "Download backup"}
        </Button>
      </Card>

      <Card className="grid gap-5">
        <div className="flex items-center gap-3">
          <Download className="text-brand" size={22} />
          <h2 className="font-display text-2xl font-semibold">
            Selective exports
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <label>
            <span className="field-label">Selection</span>
            <select
              className="field-control"
              value={selectionMode}
              onChange={(event) => setSelectionMode(event.target.value as BackupSelection["mode"])}
            >
              <option value="full">Full</option>
              <option value="date_range">Date range</option>
              <option value="track">Track</option>
            </select>
          </label>
          <label>
            <span className="field-label">From</span>
            <input
              className="field-control"
              disabled={selectionMode !== "date_range"}
              type="date"
              value={selectionFrom}
              onChange={(event) => setSelectionFrom(event.target.value)}
            />
          </label>
          <label>
            <span className="field-label">To</span>
            <input
              className="field-control"
              disabled={selectionMode !== "date_range"}
              type="date"
              value={selectionTo}
              onChange={(event) => setSelectionTo(event.target.value)}
            />
          </label>
          <label>
            <span className="field-label">Track</span>
            <select
              className="field-control"
              disabled={selectionMode !== "track"}
              value={selectionTrackId}
              onChange={(event) => setSelectionTrackId(event.target.value)}
            >
              <option value="">Choose track</option>
              {data.tracks.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button disabled={exporting} onClick={() => void exportSelectedBackup()}>
            <Download size={18} />
            JSON export
          </Button>
          <Button variant="secondary" disabled={exporting} onClick={() => void exportMarkdown()}>
            <Download size={18} />
            Markdown report
          </Button>
        </div>
      </Card>

      <Card className="grid gap-5">
        <div className="flex items-center gap-3">
          <Upload className="text-brand" size={22} />
          <h2 className="font-display text-2xl font-semibold">
            Restore from backup
          </h2>
        </div>
        <label>
          <span className="field-label">Backup JSON</span>
          <input
            className="field-control"
            type="file"
            accept="application/json,.json"
            disabled={importing}
            onChange={(event) => void importFile(event.target.files?.[0])}
          />
        </label>
        {preview ? (
          <div className="grid gap-4">
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/5">
                  <tr>
                    <th className="p-3">Table</th>
                    <th className="p-3">Create</th>
                    <th className="p-3">Update</th>
                    <th className="p-3">Unchanged</th>
                    <th className="p-3">Conflicts</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(preview.counts).map(([table, counts]) => (
                    <tr key={table} className="border-t border-line">
                      <td className="p-3 font-semibold">{table}</td>
                      <td className="p-3">{counts.create}</td>
                      <td className="p-3">{counts.update}</td>
                      <td className="p-3">{counts.unchanged}</td>
                      <td className="p-3">{counts.conflict}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.hasConflicts ? (
              <p className="text-sm font-semibold text-danger">
                Equal-timestamp conflicts must be resolved before import.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <Button disabled={importing || preview.hasConflicts} onClick={() => void applyPreview("merge")}>
                Merge backup
              </Button>
              <Button variant="danger" disabled={importing || preview.hasConflicts} onClick={() => void applyPreview("replace")}>
                Replace local data
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3">
            <Database className="text-brand" size={22} />
            <h2 className="font-semibold">Challenge configuration</h2>
          </div>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Start date</dt>
              <dd className="font-semibold">{data.settings.challengeStartDate}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">End date</dt>
              <dd className="font-semibold">{data.settings.challengeEndDate}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Week starts</dt>
              <dd className="font-semibold capitalize">
                {data.settings.weekStartsOn}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Time zone</dt>
              <dd className="text-right font-semibold">{data.settings.timeZone}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Locale</dt>
              <dd className="font-semibold">{data.settings.locale}</dd>
            </div>
          </dl>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <HardDrive className="text-brand" size={22} />
            <h2 className="font-semibold">Application information</h2>
          </div>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">App version</dt>
              <dd className="font-semibold">{packageJson.version}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Database schema</dt>
              <dd className="font-semibold">{data.metadata.schemaVersion}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Seed version</dt>
              <dd className="font-semibold">{data.metadata.seedVersion}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Initialized</dt>
              <dd className="text-right font-semibold">
                {new Date(data.metadata.initializedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <HardDrive className="text-brand" size={22} />
            <h2 className="font-semibold">Storage usage</h2>
          </div>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Used</dt>
              <dd className="font-semibold">{formatBytes(storage.usage)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Quota</dt>
              <dd className="font-semibold">{formatBytes(storage.quota)}</dd>
            </div>
          </dl>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Bell className="text-brand" size={22} />
            <h2 className="font-semibold">Reminder prompts</h2>
          </div>
          <p className="mt-3 text-sm text-muted">
            Browser notifications are best-effort; in-app reminders remain saved
            even when system delivery is unavailable.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant={data.settings.reminders.enabled ? "secondary" : "primary"}
              onClick={() => void saveReminderSettings(!data.settings.reminders.enabled)}
            >
              {data.settings.reminders.enabled ? "Disable reminders" : "Enable reminders"}
            </Button>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Download className="text-brand" size={22} />
            <h2 className="font-semibold">Install app</h2>
          </div>
          <p className="mt-3 text-sm text-muted">
            Install availability depends on the current browser and whether the
            app is already installed.
          </p>
          <div className="mt-4">
            <Button
              variant={installPrompt ? "primary" : "secondary"}
              disabled={!installPrompt}
              onClick={() => void installApp()}
            >
              {installPrompt ? "Install No Zero" : "Install unavailable"}
            </Button>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <RefreshCcw className="text-danger" size={22} />
            <h2 className="font-semibold">Reset application data</h2>
          </div>
          <p className="mt-3 text-sm text-muted">
            A full backup is downloaded first. Type RESET NO ZERO to clear and
            reinitialize local data.
          </p>
          <div className="mt-4 grid gap-3">
            <input
              className="field-control"
              value={resetPhrase}
              onChange={(event) => setResetPhrase(event.target.value)}
            />
            <Button
              variant="danger"
              disabled={resetPhrase !== "RESET NO ZERO" || importing}
              onClick={() => void resetData()}
            >
              Reset data
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function formatBytes(value: number | undefined): string {
  if (typeof value !== "number") return "Unavailable";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}
