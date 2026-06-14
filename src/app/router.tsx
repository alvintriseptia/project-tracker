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
        { path: "settings", element: deferred(<SettingsPage />) },
        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
);
