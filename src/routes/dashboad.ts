import type { RouteObject } from "react-router-dom";
import { createElement, lazy } from "react";
import { Navigate, Outlet } from "react-router-dom";
import DashboardLayout from "../layouts/Dashboard";
import ProtectedRoute from "@/components/protected-route";
import { getStoredUser } from "@/hooks/usePermissions";

// ── Lazy page imports ─────────────────────────────────────────────────────────
const Home = lazy(() => import("../pages/index"));
const Store = lazy(() => import("../pages/store"));
const CreateStore = lazy(() => import("../pages/store/create"));
const UpdateStore = lazy(() => import("../pages/store/update"));
const Suppliers = lazy(() => import("../pages/supplier"));
const SupplierCreate = lazy(() => import("../pages/supplier/create"));
const SupplierUpdate = lazy(() => import("../pages/supplier/update"));
const Users = lazy(() => import("../pages/users"));
const UserCreate = lazy(() => import("../pages/users/create"));
const UserUpdate = lazy(() => import("../pages/users/update"));
const Sales = lazy(() => import("../pages/sales"));
const SalesCreate = lazy(() => import("../pages/sales/create"));
const SalesUpdate = lazy(() => import("../pages/sales/update"));
const Purchases = lazy(() => import("../pages/purchases"));
const PurchasesCreate = lazy(() => import("../pages/purchases/create"));
const PurchasesUpdate = lazy(() => import("../pages/purchases/update"));
const Categories = lazy(() => import("../pages/categories"));
const CreateCategories = lazy(() => import("../pages/categories/create"));
const UpdateCategories = lazy(() => import("../pages/categories/update"));
const Customers = lazy(() => import("../pages/customers/index"));
const Reports = lazy(() => import("../pages/reports/index"));
const ReportForm = lazy(() => import("../pages/reports/ReportForm"));
const Profile = lazy(() => import("../pages/Profile"));
const Unauthorized = lazy(() => import("../pages/Unauthorized"));

// ── RouteGuard factory (works in .ts without JSX) ────────────────────────────
// Creates a unique component per permission that reads user synchronously from
// localStorage (avoids Jotai hydration delay at route level).
function makeGuard(permission: string) {
  return function PermissionGuard() {
    const user = getStoredUser();
    if (!user) return createElement(Navigate, { to: "/login", replace: true });
    if (user.role === "admin") return createElement(Outlet, null);
    if (!user.permissions?.includes(permission as Permission)) {
      return createElement(Navigate, { to: "/unauthorized", replace: true });
    }
    return createElement(Outlet, null);
  };
}

// One guard component per protected section (each must be a unique reference)
const StoreGuard = makeGuard("view_store");
const CategoryGuard = makeGuard("view_category");
const SupplierGuard = makeGuard("view_supplier");
const CustomerGuard = makeGuard("view_customer");
const UsersGuard = makeGuard("view_users");
const SalesGuard = makeGuard("view_sale");
const PurchasesGuard = makeGuard("view_purchase");

// ── Route tree ────────────────────────────────────────────────────────────────
export const DashboardRoutes: RouteObject = {
  path: "",
  Component: ProtectedRoute,
  children: [
    {
      path: "",
      Component: DashboardLayout,
      children: [
        // Available to every authenticated user
        { index: true, path: "", Component: Home },
        { path: "profile", Component: Profile },
        { path: "unauthorized", Component: Unauthorized },

        // ── Reports ─────────────────────────────────────────────────────────────
        {
          path: "reports",
          children: [
            { index: true, path: "", Component: Reports },
            { path: "create", Component: ReportForm },
            { path: ":id/edit", Component: ReportForm },
          ],
        },

        // ── Store ─────────────────────────────────────────────────────────────
        {
          path: "store",
          Component: StoreGuard,
          children: [
            { index: true, path: "", Component: Store },
            { path: "create", Component: CreateStore },
            { path: ":id/update", Component: UpdateStore },
          ],
        },

        // ── Categories ────────────────────────────────────────────────────────
        {
          path: "categories",
          Component: CategoryGuard,
          children: [
            { index: true, path: "", Component: Categories },
            { path: "create", Component: CreateCategories },
            { path: ":id/update", Component: UpdateCategories },
          ],
        },

        // ── Suppliers ─────────────────────────────────────────────────────────
        {
          path: "supplier",
          Component: SupplierGuard,
          children: [
            { index: true, path: "", Component: Suppliers },
            { path: "create", Component: SupplierCreate },
            { path: ":id/update", Component: SupplierUpdate },
          ],
        },

        // ── Customers ─────────────────────────────────────────────────────────
        {
          path: "customers",
          Component: CustomerGuard,
          children: [
            { index: true, path: "", Component: Customers },
          ],
        },

        // ── Users ─────────────────────────────────────────────────────────────
        {
          path: "users",
          Component: UsersGuard,
          children: [
            { index: true, path: "", Component: Users },
            { path: "create", Component: UserCreate },
            { path: ":id/update", Component: UserUpdate },
          ],
        },

        // ── Sales ─────────────────────────────────────────────────────────────
        {
          path: "sales",
          Component: SalesGuard,
          children: [
            { index: true, path: "", Component: Sales },
            { path: "create", Component: SalesCreate },
            { path: ":id/update", Component: SalesUpdate },
          ],
        },

        // ── Purchases ─────────────────────────────────────────────────────────
        {
          path: "purchase",
          Component: PurchasesGuard,
          children: [
            { index: true, path: "", Component: Purchases },
            { path: "create", Component: PurchasesCreate },
            { path: ":id/update", Component: PurchasesUpdate },
          ],
        },
      ],
    },
  ],
};
