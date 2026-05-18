import { Navigate, Outlet } from "react-router-dom";

/**
 * Reads the token synchronously from localStorage.
 * atomWithStorage (Jotai) serializes values as JSON, so we parse accordingly.
 * Reading directly avoids the async-hydration delay that causes a redirect
 * to /login on every page reload.
 */
function getToken(): string | null {
  try {
    const raw = localStorage.getItem("token");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed === "string" && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export default function ProtectedRoute() {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
