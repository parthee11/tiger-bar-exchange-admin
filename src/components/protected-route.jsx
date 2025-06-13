import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/auth-context';

/**
 * ProtectedRoute component that redirects to sign-in if user is not authenticated
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when authenticated
 * @returns {React.ReactElement} Protected route component
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  // Render children if authenticated
  return children;
}

// Add PropTypes for type checking
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};