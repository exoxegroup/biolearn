
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!user?.isProfileComplete && location.pathname !== '/complete-profile') {
      return <Navigate to="/complete-profile" replace />;
  }

  if (user?.isProfileComplete && location.pathname === '/complete-profile') {
      const targetDashboard = user.role === 'TEACHER' ? '/teacher-dashboard' : '/student-dashboard';
      return <Navigate to={targetDashboard} replace />;
  }

  if (role && user?.role !== role) {
    const targetDashboard = user?.role === 'TEACHER' ? '/teacher-dashboard' : '/student-dashboard';
    return <Navigate to={targetDashboard} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
