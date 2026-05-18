import { Navigate, Outlet } from "react-router-dom";
import { getStoredUser } from "@/hooks/usePermissions";

interface RouteGuardProps {
  /** The permission required to access this route */
  permission: string;
}

/**
 * Route-level permission guard. Reads from localStorage synchronously
 * (avoiding Jotai's async hydration delay).
 *
 * Admin role → always passes through.
 * Missing permission → redirects to /unauthorized.
 * No user at all → redirects to /login (ProtectedRoute should catch this first).
 */
export default function RouteGuard({ permission }: RouteGuardProps) {
  const user = getStoredUser();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Outlet />;
  if (!user.permissions?.includes(permission as Permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
