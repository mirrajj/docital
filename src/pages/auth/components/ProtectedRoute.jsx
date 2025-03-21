
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../authContext/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const { isAuthenticated, loading,currentUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
    // If allowedRoles specified, check if user has permission
    if (allowedRoles && allowedRoles.length > 0) {
      // Option 1: Check by role ID (UUID)
      const hasRoleById = currentUser.roleId && allowedRoles.includes(currentUser.roleId);
      
      // Option 2: Check by role name 
      const hasRoleByName = currentUser.roleName && allowedRoles.includes(currentUser.roleName);
      
      // Grant access if user has the role by either ID or name
      if (!hasRoleById && !hasRoleByName) {
        // Redirect to unauthorized page or dashboard
        return <Navigate to="/unauthorized" replace />;
      }
    }

  return children;
};

export default ProtectedRoute;