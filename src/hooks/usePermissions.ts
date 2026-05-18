import { useAtomValue } from "jotai";
import { currentUserAtom } from "@/atoms";

/**
 * Central hook for all permission checks in the UI.
 *
 * Usage:
 *   const { can, isAdmin, user } = usePermissions();
 *   if (can("delete_store")) { ... }
 */
export const usePermissions = () => {
  const user = useAtomValue(currentUserAtom);
  const isAdmin = user?.role === "admin";

  const can = (permission: string): boolean => {
    if (!user) return false;
    if (isAdmin) return true;
    return user.permissions?.includes(permission as Permission) ?? false;
  };

  const canAny = (...permissions: string[]): boolean =>
    permissions.some((p) => can(p));

  const canAll = (...permissions: string[]): boolean =>
    permissions.every((p) => can(p));

  return {
    user,
    isAdmin,
    can,
    canAny,
    canAll,
    permissions: user?.permissions ?? [],
  };
};

// ── Helper: read synchronously from localStorage for route guards ─────────────
// (Jotai's atomWithStorage has a brief null before hydrating — not safe for routes)
export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem("current_user");
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}
