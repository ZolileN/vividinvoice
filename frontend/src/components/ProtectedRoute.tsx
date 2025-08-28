import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useGetMe } from '../api/authService';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  requiredRole?: string[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole = [],
  redirectPath = '/login',
}) => {
  const { data: user, isLoading, error } = useGetMe();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // If there's an error or no user, redirect to login
  if (error || !user) {
    return <Navigate to={redirectPath} replace />;
  }

  // Check if user has required role if specified
  if (requiredRole.length > 0 && !requiredRole.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and authorized, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
