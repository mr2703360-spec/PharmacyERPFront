import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";

interface PermissionGateProps {
  /** Permission key required to see the children */
  permission: string;
  /** Optional content to render when the user lacks permission */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Conditionally renders children based on a permission.
 *
 * Admin always sees children.
 * Non-admin users only see children if they have the required permission.
 *
 * Usage:
 *   <PermissionGate permission="create_store">
 *     <Button>Add Medicine</Button>
 *   </PermissionGate>
 */
export function PermissionGate({ permission, fallback = null, children }: PermissionGateProps) {
  const { can } = usePermissions();
  return can(permission) ? <>{children}</> : <>{fallback}</>;
}
