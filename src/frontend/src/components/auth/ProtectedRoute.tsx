import type { ReactElement } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export interface ProtectedRouteProps {
  /** Optional permission required to view the wrapped route. */
  readonly requiredPermission?: string;
}

/**
 * React Router v6 layout route wrapper. Redirects to /login when there is no
 * access token in the auth store. Renders an Outlet for nested routes.
 */
export function ProtectedRoute({ requiredPermission }: ProtectedRouteProps): ReactElement {
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
