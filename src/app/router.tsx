import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import { TodayPage } from "../features/today/TodayPage";
import { AppShell } from "./AppShell";
import { NotFoundPage } from "./NotFoundPage";

const ProjectsPage = lazy(() =>
  import("../features/projects/ProjectsPage").then((module) => ({
    default: module.ProjectsPage,
  })),
);
const ProjectDetailPage = lazy(() =>
  import("../features/projects/ProjectDetailPage").then((module) => ({
    default: module.ProjectDetailPage,
  })),
);
const SettingsPage = lazy(() =>
  import("../features/settings/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  })),
);
const ArtifactsPage = lazy(() =>
  import("../features/artifacts/ArtifactsPage").then((module) => ({ default: module.ArtifactsPage })),
);
const ArtifactEditorPage = lazy(() =>
  import("../features/artifacts/ArtifactEditorPage").then((module) => ({ default: module.ArtifactEditorPage })),
);
const ArtifactDetailPage = lazy(() =>
  import("../features/artifacts/ArtifactDetailPage").then((module) => ({ default: module.ArtifactDetailPage })),
);
const WeeklyReviewPage = lazy(() =>
  import("../features/reviews/WeeklyReviewPage").then((module) => ({ default: module.WeeklyReviewPage })),
);
const MissionsPage = lazy(() =>
  import("../features/missions/MissionsPage").then((module) => ({ default: module.MissionsPage })),
);
const MissionDetailPage = lazy(() =>
  import("../features/missions/MissionDetailPage").then((module) => ({ default: module.MissionDetailPage })),
);
const CalendarPage = lazy(() =>
  import("../features/calendar/CalendarPage").then((module) => ({ default: module.CalendarPage })),
);
const InsightsPage = lazy(() =>
  import("../features/insights/InsightsPage").then((module) => ({ default: module.InsightsPage })),
);
const SearchPage = lazy(() =>
  import("../features/search/SearchPage").then((module) => ({ default: module.SearchPage })),
);

function deferred(element: React.ReactNode) {
  return (
    <Suspense fallback={<p className="text-muted">Loading screen...</p>}>
      {element}
    </Suspense>
  );
}

export const router = createBrowserRouter(
  [
    {
      element: <AppShell />,
      children: [
        { index: true, element: <TodayPage /> },
        { path: "projects", element: deferred(<ProjectsPage />) },
        {
          path: "projects/:trackId",
          element: deferred(<ProjectDetailPage />),
        },
        { path: "calendar", element: deferred(<CalendarPage />) },
        { path: "reviews/weekly", element: deferred(<WeeklyReviewPage />) },
        { path: "missions", element: deferred(<MissionsPage />) },
        { path: "missions/:month", element: deferred(<MissionDetailPage />) },
        { path: "artifacts", element: deferred(<ArtifactsPage />) },
        { path: "artifacts/new/:type?", element: deferred(<ArtifactEditorPage />) },
        { path: "artifacts/:artifactId/edit", element: deferred(<ArtifactEditorPage />) },
        { path: "artifacts/:artifactId", element: deferred(<ArtifactDetailPage />) },
        { path: "insights", element: deferred(<InsightsPage />) },
        { path: "search", element: deferred(<SearchPage />) },
        { path: "settings", element: deferred(<SettingsPage />) },
        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
);
