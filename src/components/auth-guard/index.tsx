import { Navigate, Outlet } from "react-router-dom";

/**
 * Reads the token synchronously from localStorage.
 * Mirrors the same logic as ProtectedRoute for consistency.
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

/**
 * Prevents logged-in users from accessing the login page.
 * If a token exists → redirect to dashboard.
 * If no token → show login page.
 */
export default function AuthGuard() {
  const token = getToken();

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}