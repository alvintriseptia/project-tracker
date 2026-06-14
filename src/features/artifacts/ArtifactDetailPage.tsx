import { useLiveQuery } from "dexie-react-hooks";
import { Archive, ArrowLeft, ExternalLink, Pencil, RotateCcw } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { Button } from "../../components/Button";
import { useToast } from "../../components/ToastProvider";
import { db } from "../../db/database";
import { storageErrorMessage } from "../../db/errors";
import { setArtifactArchived } from "./artifactService";

export function ArtifactDetailPage() {
  const { artifactId = "" } = useParams();
  const artifact = useLiveQuery(() => db.artifacts.get(artifactId), [artifactId], null);
  const { announce } = useToast();
  if (artifact === null) return <p className="text-muted">Loading artifact…</p>;
  if (!artifact) return <p>Artifact not found.</p>;
  const currentArtifact = artifact;
  async function toggleArchive() {
    try {
      await setArtifactArchived({ database: db, artifact: currentArtifact, archived: currentArtifact.status !== "archived" });
      announce(currentArtifact.status === "archived" ? "Artifact restored." : "Artifact archived.");
    } catch (error) {
      announce(storageErrorMessage(error));
    }
  }
  return (
    <article className="mx-auto max-w-3xl">
      <Link to="/artifacts" className="inline-flex min-h-11 items-center gap-2 font-semibold text-brand"><ArrowLeft size={18} />Artifacts</Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-kicker">{artifact.type.replaceAll("_", " ")} · {artifact.status}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">{artifact.title}</h1>
          <p className="mt-2 text-muted">{artifact.date}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" asChild><Link to={`/artifacts/${artifact.id}/edit`}><Pencil size={17} />Edit</Link></Button>
          <Button variant="secondary" onClick={() => void toggleArchive()}>
            {artifact.status === "archived" ? <RotateCcw size={17} /> : <Archive size={17} />}
            {artifact.status === "archived" ? "Restore" : "Archive"}
          </Button>
        </div>
      </div>
      <div className="mt-7 rounded-2xl border border-line bg-surface p-6">
        <div className="whitespace-pre-wrap leading-7">{artifact.content || "No content yet."}</div>
        {artifact.externalLink ? (
          <a className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-brand" href={artifact.externalLink} target="_blank" rel="noreferrer noopener">
            Open external link <ExternalLink size={17} />
          </a>
        ) : null}
      </div>
    </article>
  );
}
