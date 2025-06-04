import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './layouts/dashboard-layout'
import { Dashboard } from './pages/dashboard'
import { Items } from './pages/items'
import { Mixers } from './pages/mixers'
import { MarketCrash } from './pages/market-crash'
import { Orders } from './pages/orders'
import { Prebookings } from './pages/prebookings'
import { Branches } from './pages/branches'
import { Categories } from './pages/categories'
import { Loyalty } from './pages/loyalty'
import { Settings } from './pages/settings'
import { SignIn } from './pages/sign-in'
import { ProtectedRoute } from './components/protected-route'
import { PublicRoute } from './components/public-route'
import { AuthProvider } from './contexts/auth-context'
import { ConfirmationProvider } from './components/providers/confirmation-provider'
import './App.css'

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
          
          {/* Protected Dashboard Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/items" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Items />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mixers" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Mixers />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/market-crash" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MarketCrash />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Orders />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/prebookings" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Prebookings />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/branches" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Branches />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/categories" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Categories />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/loyalty" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Loyalty />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </ConfirmationProvider>
    </AuthProvider>
  )
}

export default App
