import { useLiveQuery } from "dexie-react-hooks";
import { Database, Download, HardDrive, ShieldCheck } from "lucide-react";
import { useState } from "react";

import packageJson from "../../../package.json";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { useToast } from "../../components/ToastProvider";
import { db } from "../../db/database";
import { storageErrorMessage } from "../../db/errors";
import {
  MetadataRepository,
  SettingsRepository,
} from "../../db/repositories";
import { downloadFullBackup } from "./exportService";

const settingsRepository = new SettingsRepository(db);
const metadataRepository = new MetadataRepository(db);

export function SettingsPage() {
  const data = useLiveQuery(async () => {
    const [settings, metadata] = await Promise.all([
      settingsRepository.get(),
      metadataRepository.get(),
    ]);
    return { settings, metadata };
  }, []);
  const [exporting, setExporting] = useState(false);
  const { announce } = useToast();

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
      </div>
    </div>
  );
}
