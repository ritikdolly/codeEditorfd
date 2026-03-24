import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const roleHome = {
  super_admin: '/admin',
  campus_admin: '/campus-admin',
  platform_staff: '/admin',
  campus_staff: '/staff',
  dean: '/dean',
  hod: '/hod',
  mentor: '/mentor',
  teacher: '/teacher',
  student: '/student',
};

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
 
  // Force password change if required, but don't loop
  if (user.mustChangePassword && window.location.pathname !== '/force-password-change') {
    return <Navigate to="/force-password-change" replace />;
  }

  const userRole = user.role?.toLowerCase();
  const allowed = allowedRoles?.map(r => r.toLowerCase());

  if (allowed && !allowed.includes(userRole)) {
    return <Navigate to={roleHome[userRole] || '/login'} replace />;
  }

  return children;
};
