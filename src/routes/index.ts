import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { AuthRoutes } from "./auth.ts";
import { DashboardRoutes } from "./dashboad.ts";
const NotFound = lazy(() => import("../pages/NotFound.tsx"));
const Layout = lazy(() => import("../layouts/index.tsx"));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        path: "",
        children: [DashboardRoutes],
      },
      AuthRoutes,
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);
