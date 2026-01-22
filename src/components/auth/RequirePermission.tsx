import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import type { AdminPermission } from "@/components/admin/PermissionsDialog";

interface RequirePermissionProps {
  children: ReactNode;
  permission: AdminPermission;
  /** If true, allows access to any admin (for general admin pages) */
  adminOnly?: boolean;
}

/**
 * Route guard component that checks for specific admin permissions.
 * Redirects to 403 Forbidden page if the user lacks the required permission.
 */
export function RequirePermission({ children, permission, adminOnly = false }: RequirePermissionProps) {
  const { user, role, loading } = useAuth();
  const { permissions, isLoading } = useAdminPermissions(user?.id);

  // Show loading state while checking auth/permissions
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to forbidden if not an admin
  if (role !== "admin") {
    return <Navigate to="/forbidden" replace />;
  }

  // If adminOnly, allow any admin through
  if (adminOnly) {
    return <>{children}</>;
  }

  // Check for specific permission
  if (!permissions.includes(permission)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}
