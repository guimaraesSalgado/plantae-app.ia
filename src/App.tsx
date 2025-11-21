import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import { useEffect, Suspense, lazy, useState } from 'react'
import { hydrateStorage } from './lib/storage'
import { LoadingOverlay } from './components/LoadingOverlay'

// Lazy load pages
const Index = lazy(() => import('./pages/Index'))
const AddPlant = lazy(() => import('./pages/AddPlant'))
const PlantDetails = lazy(() => import('./pages/PlantDetails'))
const EditPlant = lazy(() => import('./pages/EditPlant'))
const SyncBackup = lazy(() => import('./pages/SyncBackup'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Splash = lazy(() => import('./pages/Splash'))
const Login = lazy(() => import('./pages/Login'))
const Profile = lazy(() => import('./pages/Profile'))
const Notifications = lazy(() => import('./pages/Notifications'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const SetUsername = lazy(() => import('./pages/SetUsername'))
const History = lazy(() => import('./pages/History'))
const Plants = lazy(() => import('./pages/Plants'))

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { session, loading, profile } = useAuth()
  const location = useLocation()

  // Show loading overlay instead of null to avoid "stuck" feeling
  if (loading) {
    return <LoadingOverlay isVisible={true} message="Verificando acesso..." />
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  // Check for temporary password active flag
  if (profile?.is_temporary_password_active) {
    if (location.pathname !== '/reset-password') {
      return <Navigate to="/reset-password" replace />
    }
  } else if (location.pathname === '/reset-password') {
    // If not active but trying to access reset password, redirect home
    return <Navigate to="/" replace />
  }

  // If user is logged in but has no username, force them to set it
  // Skip this check if they are on reset password page
  if (
    profile &&
    !profile.username &&
    window.location.pathname !== '/set-username' &&
    window.location.pathname !== '/reset-password'
  ) {
    return <Navigate to="/set-username" replace />
  }

  return children
}

const AppRoutes = () => {
  const location = useLocation()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    setIsNavigating(true)
    const timer = setTimeout(() => setIsNavigating(false), 500) // Slightly longer for smoothness
    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <>
      <LoadingOverlay isVisible={isNavigating} />
      <Suspense fallback={<LoadingOverlay isVisible={true} />}>
        <Routes>
          <Route path="/splash" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />

          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Index />} />
            <Route path="/plants" element={<Plants />} />
            <Route path="/set-username" element={<SetUsername />} />
            <Route path="/add" element={<AddPlant />} />
            <Route path="/plant/:id" element={<PlantDetails />} />
            <Route path="/plant/:id/edit" element={<EditPlant />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/history" element={<History />} />
            <Route path="/sync-backup" element={<SyncBackup />} />
          </Route>

          {/* Reset Password is protected but doesn't use Layout to avoid navigation */}
          <Route
            path="/reset-password"
            element={
              <RequireAuth>
                <ResetPassword />
              </RequireAuth>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}

const App = () => {
  useEffect(() => {
    hydrateStorage()
  }, [])

  return (
    <BrowserRouter
      future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
    >
      <AuthProvider>
        <ScrollToTop />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
