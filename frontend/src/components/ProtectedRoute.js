import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { isAuthenticated, getUser } from "services/authApi";
import { ROLES } from "constants/roles";

/**
 * ProtectedRoute Component
 * Bảo vệ routes, kiểm tra authentication và role
 *
 * @param {React.ReactNode} children - Component cần bảo vệ
 * @param {Array} allowedRoles - Mảng các role được phép (optional)
 * @param {boolean} requiresAuth - Có cần authentication không (default: true)
 */
export default function ProtectedRoute({ children, allowedRoles = null, requiresAuth = true }) {
  const location = useLocation();
  const authenticated = isAuthenticated();
  const user = getUser();

  // Nếu route không cần auth, cho phép truy cập
  if (!requiresAuth) {
    return children;
  }

  // Nếu chưa đăng nhập, redirect đến login
  if (!authenticated || !user) {
    return <Navigate to="/authentication/sign-in" state={{ from: location }} replace />;
  }

  // Nếu route có yêu cầu role cụ thể
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role;

    // Kiểm tra user có role phù hợp không
    if (!allowedRoles.includes(userRole)) {
      // Redirect đến dashboard phù hợp với role
      if (userRole === ROLES.ADMIN) {
        return <Navigate to="/admin" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  // Cho phép truy cập
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.array,
  requiresAuth: PropTypes.bool,
};
