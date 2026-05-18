import { lazy } from "react";
import type { RouteObject } from "react-router";
import AuthLayout from "../layouts/Auth";
import AuthGuard from "@/components/auth-guard";
const Login = lazy(() => import("../pages/auth/login"));

export const AuthRoutes: RouteObject = {
  path: "",
  Component: AuthLayout,
  children: [
    {
      path: "login",
      Component:AuthGuard,
      children: [{ path: "", Component: Login }],
    },
  ],
};
