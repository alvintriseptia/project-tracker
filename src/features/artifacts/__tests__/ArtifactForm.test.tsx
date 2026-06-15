import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, vi } from "vitest";

import {
  defaultDetails,
  devlogTemplate,
  englishTemplates,
} from "../../../domain/specializedArtifacts";
import { buildArtifact, buildTrack } from "../../../test/builders";
import { ArtifactForm } from "../ArtifactForm";
import type { ArtifactFormValues } from "../artifactFormSchema";

const today = "2026-06-15" as const;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ArtifactForm defaults", () => {
  it("preserves unknown generic details when editing", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn<(values: ArtifactFormValues) => Promise<void>>(
      () => Promise.resolve(),
    );
    const artifact = buildArtifact({
      details: {
        kind: "generic",
        source: "legacy-import",
        nested: { retained: true },
      },
    });

    render(
      <ArtifactForm
        artifact={artifact}
        tracks={[buildTrack()]}
        today={today}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save artifact" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0]?.[0].details).toEqual(artifact.details);
  });

  it("keeps an empty project when editing even if defaults are supplied", async () => {
    const user = userEvent.setup();
    render(
      <ArtifactForm
        artifact={buildArtifact({
          type: "custom",
          details: { kind: "generic" },
        })}
        tracks={[buildTrack()]}
        today={today}
        initialTrackId="english"
        onSubmit={() => Promise.resolve()}
      />,
    );

    const project = screen.getByRole("combobox", { name: "Project" });
    expect(project).toHaveValue("");

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Type" }),
      "english_note",
    );

    expect(project).toHaveValue("");
  });

  it.each([
    {
      name: "English",
      type: "english_note" as const,
      details: defaultDetails("english_note"),
      buttonName: "Apply Technical Explanation",
      expectedContent: englishTemplates.technical_explanation,
    },
    {
      name: "Devlog",
      type: "devlog" as const,
      details: defaultDetails("devlog"),
      buttonName: "Apply devlog template",
      expectedContent: devlogTemplate,
    },
  ])("replaces whitespace-only content with the $name template without confirming", async ({
    type,
    details,
    buttonName,
    expectedContent,
  }) => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm");

    render(
      <ArtifactForm
        artifact={buildArtifact({
          type,
          content: "   \n",
          details,
        })}
        tracks={[buildTrack()]}
        today={today}
        onSubmit={() => Promise.resolve()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: buttonName }),
    );

    expect(confirm).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox", { name: "Content" })).toHaveValue(
      expectedContent,
    );
  });
});
