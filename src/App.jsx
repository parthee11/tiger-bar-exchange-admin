import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/dashboard-layout';
import { Dashboard } from './pages/dashboard';
import { Items } from './pages/items';
import { Mixers } from './pages/mixers';
import { MarketCrash } from './pages/market-crash';
import { Orders } from './pages/orders';
import { Prebookings } from './pages/prebookings';
import { PrebookingDetail } from './pages/prebooking-detail';
import { Branches } from './pages/branches';
import { Categories } from './pages/categories';
import { Loyalty } from './pages/loyalty';
import { Settings } from './pages/settings';
import { SignIn } from './pages/sign-in';
import TableManagement from './pages/tables';
import { ProtectedRoute } from './components/protected-route';
import { PublicRoute } from './components/public-route';
import { AuthProvider } from './contexts/auth-context';
import { ConfirmationProvider } from './components/providers/confirmation-provider';
import { Toaster } from './components/ui/toaster';
import './App.css';

/**
 * Route configuration for better maintainability
 * Each route object defines:
 * - path: URL path for the route
 * - component: Component to render at this path
 * - protected: Whether the route requires authentication
 * - title: Optional title for the page (for future use with document.title)
 */
const routes = [
  {
    path: '/',
    component: Dashboard,
    protected: true,
    title: 'Dashboard',
  },
  {
    path: '/items',
    component: Items,
    protected: true,
    title: 'Inventory Items',
  },
  {
    path: '/mixers',
    component: Mixers,
    protected: true,
    title: 'Mixers',
  },
  {
    path: '/market-crash',
    component: MarketCrash,
    protected: true,
    title: 'Market Crash',
  },
  {
    path: '/orders',
    component: Orders,
    protected: true,
    title: 'Orders',
  },
  {
    path: '/prebookings',
    component: Prebookings,
    protected: true,
    title: 'Reservations',
  },
  {
    path: '/prebooking-detail/:id',
    component: PrebookingDetail,
    protected: true,
    title: 'Reservation Details',
  },
  {
    path: '/branches',
    component: Branches,
    protected: true,
    title: 'Branches',
  },
  {
    path: '/tables',
    component: TableManagement,
    protected: true,
    title: 'Table Management',
  },
  {
    path: '/categories',
    component: Categories,
    protected: true,
    title: 'Categories',
  },
  {
    path: '/loyalty',
    component: Loyalty,
    protected: true,
    title: 'Loyalty Programs',
  },
  {
    path: '/settings',
    component: Settings,
    protected: true,
    title: 'Settings',
  },
];

/**
 * Main App component that sets up routing and global providers
 * 
 * @returns {React.ReactElement} The App component
 */
function App() {
  return (
    <AuthProvider>
      <ConfirmationProvider>
        <Router>
          <Routes>
            {/* Authentication Routes */}
            <Route path="/sign-in" element={<PublicRoute><SignIn /></PublicRoute>} />
            {/* Sign-up route is hidden from UI but kept for future use */}
            <Route path="/sign-up" element={<Navigate to="/sign-in" replace />} />
            
            {/* Protected Dashboard Routes - Generated from configuration */}
            {routes.map(({ path, component: Component, protected: isProtected }) => (
              <Route
                key={path}
                path={path}
                element={
                  isProtected ? (
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Component />
                      </DashboardLayout>
                    </ProtectedRoute>
                  ) : (
                    <Component />
                  )
                }
              />
            ))}
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </Router>
      </ConfirmationProvider>
    </AuthProvider>
  );
}

export default App
