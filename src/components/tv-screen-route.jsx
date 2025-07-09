import PropTypes from 'prop-types';

/**
 * TVScreenRoute component that allows access regardless of authentication status
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {React.ReactElement} TV Screen route component
 */
export function TVScreenRoute({ children }) {
  // Always render children without authentication check
  return children;
}

// Add PropTypes for type checking
TVScreenRoute.propTypes = {
  children: PropTypes.node.isRequired,
};