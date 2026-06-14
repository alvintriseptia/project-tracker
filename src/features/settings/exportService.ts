import packageJson from "../../../package.json";
import { createBackupEnvelope } from "../../domain/backup";
import type { BackupEnvelope } from "../../domain/types";
import type { NoZeroDatabase } from "../../db/database";
import {
  MetadataRepository,
  readFullSnapshot,
} from "../../db/repositories";

export async function prepareFullBackup(
  database: NoZeroDatabase,
  now = new Date(),
): Promise<{
  envelope: BackupEnvelope;
  json: string;
  filename: string;
}> {
  const metadata = await new MetadataRepository(database).get();
  const data = await readFullSnapshot(database);
  const envelope = createBackupEnvelope({
    schemaVersion: metadata.schemaVersion,
    appVersion: packageJson.version,
    exportedAt: now.toISOString(),
    data,
  });
  return {
    envelope,
    json: JSON.stringify(envelope, null, 2),
    filename: `no-zero-backup-${now.toISOString().slice(0, 10)}.json`,
  };
}

export async function downloadFullBackup(
  database: NoZeroDatabase,
  now = new Date(),
): Promise<string> {
  const prepared = await prepareFullBackup(database, now);
  const url = URL.createObjectURL(
    new Blob([prepared.json], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = prepared.filename;
  anchor.click();
  URL.revokeObjectURL(url);

  const metadataRepository = new MetadataRepository(database);
  const metadata = await metadataRepository.get();
  await metadataRepository.put({
    ...metadata,
    lastBackupAt: now.toISOString(),
  });
  return prepared.filename;
}
