import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { isAuthenticated } from '../utils/auth';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  redirectPath?: string;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectPath = '/login',
  requireAdmin = false,
}) => {
  const { user, isAuthenticated: isAuth } = useAppSelector((state) => state.auth);
  const isUserAuthenticated = isAuthenticated() && isAuth;
  
  // Check if admin access is required and user is admin
  const isAuthorized = requireAdmin 
    ? isUserAuthenticated && user?.role === 'admin'
    : isUserAuthenticated;

  if (!isAuthorized) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
