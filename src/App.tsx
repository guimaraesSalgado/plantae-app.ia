import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import Layout from './components/Layout'
import Index from './pages/Index'
import AddPlant from './pages/AddPlant'
import PlantDetails from './pages/PlantDetails'
import EditPlant from './pages/EditPlant'
import SyncBackup from './pages/SyncBackup'
import Onboarding from './pages/Onboarding'
import NotFound from './pages/NotFound'
import Splash from './pages/Splash'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import ForgotPassword from './pages/ForgotPassword'
import SetUsername from './pages/SetUsername'
import History from './pages/History'
import ScrollToTop from './components/ScrollToTop'
import { useEffect } from 'react'
import { hydrateStorage } from './lib/storage'

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { session, loading, profile } = useAuth()

  if (loading) return null

  if (!session) {
    return <Navigate to="/login" replace />
  }

  // If user is logged in but has no username, force them to set it
  // We check if profile is loaded and username is missing
  if (
    profile &&
    !profile.username &&
    window.location.pathname !== '/set-username'
  ) {
    return <Navigate to="/set-username" replace />
  }

  return children
}

const AppRoutes = () => {
  return (
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
        <Route path="/set-username" element={<SetUsername />} />
        <Route path="/add" element={<AddPlant />} />
        <Route path="/plant/:id" element={<PlantDetails />} />
        <Route path="/plant/:id/edit" element={<EditPlant />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/history" element={<History />} />
        <Route path="/sync-backup" element={<SyncBackup />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
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
